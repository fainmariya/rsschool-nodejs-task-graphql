import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

import depthLimit from 'graphql-depth-limit';
import { schema } from './schema.js';        
import { createLoaders } from './loaders.js'; 
import { graphql, parse, validate } from 'graphql';


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
    
      // 1. Парсим запрос в AST
      const documentAST = parse(query);
    
      // 2. Валидируем глубину с помощью depthLimit(5)
      const validationErrors = validate(schema, documentAST, [depthLimit(5)]);
    
      if (validationErrors.length > 0) {
        // Если глубина слишком большая — сразу отдаём errors,
        // в формате, который ожидает твой gqlResponseSchema: { data?, errors? }
        return reply.send({
          data: null,
          errors: validationErrors,
        });
      }
    
      // 3. Если всё ок — выполняем запрос
      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        operationName,
        contextValue,
      });
      if (result.errors && result.errors.length > 0) {
        // временный лог ошибок GraphQL
        console.error(
          'GQL ERRORS:',
          JSON.stringify(result.errors, null, 2),
        );
      }
      return reply.send(result);
    }  });
};


export default plugin;
