// src/routes/graphql/index.ts
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate, execute, specifiedRules } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './schema.js';
import { createLoaders } from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables, operationName } = req.body as {
        query: string;
        variables?: Record<string, unknown>;
        operationName?: string | null;
      };

      const contextValue = {
        prisma,
        prismaStats: fastify.prismaStats,
        loaders: createLoaders(prisma),
        req,
        reply,
      };

      // через parse / validate / execute, чтобы rule-тест работал
      const document = parse(query);
      const errors = validate(schema, document, [...specifiedRules, depthLimit(5)]);
      if (errors.length > 0) {
        return reply.send({ errors });
      }

      const result = await execute({
        schema,
        document,
        variableValues: variables,
        operationName,
        contextValue,
      });

      return reply.send(result);
    },
  });
};

export default plugin;
