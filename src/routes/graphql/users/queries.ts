// src/routes/graphql/users/queries.ts
import {
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo, type ResolveTree } from 'graphql-parse-resolve-info';

import { UUIDType } from '../types/uuid.js';
import { UserType } from './types.js';
import {
  CreateUserInputType,
  ChangeUserInputType,
} from './inputs.js';
import type { Loaders } from '../loaders.js';

type GqlContext = {
  prisma: any;
  loaders: Loaders;
};

export const queryFields = {
  // GET /users  →  users
  users: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(UserType)),
    ),
    async resolve(
      _src: unknown,
      _args: unknown,
      context: GqlContext,
      info: GraphQLResolveInfo,
    ) {
      const { prisma, loaders } = context;

      // Разбираем, какие поля реально запросили у users { ... }
      const parsed = parseResolveInfo(info) as ResolveTree | null;

      let needUserSubscribedTo = false;
      let needSubscribedToUser = false;

      if (parsed && parsed.fieldsByTypeName) {
        // users: [User!]! → берём описание полей типа User
        const userFields =
          parsed.fieldsByTypeName.User ??
          Object.values(parsed.fieldsByTypeName)[0];

        if (userFields) {
          needUserSubscribedTo = Boolean(
            (userFields as any).userSubscribedTo,
          );
          needSubscribedToUser = Boolean(
            (userFields as any).subscribedToUser,
          );
        }
      }

      const prismaArgs: any = {};

      // ВАЖНО для test-loader-prime:
      // если нужны сабы — делаем ровно ОДИН findMany с include
      if (needUserSubscribedTo || needSubscribedToUser) {
        prismaArgs.include = {
          ...(needUserSubscribedTo ? { userSubscribedTo: true } : {}),
          ...(needSubscribedToUser ? { subscribedToUser: true } : {}),
        };
      }

      // Единственный вызов User.findMany (его и ждёт test-loader-prime)
      const users = await prisma.user.findMany(prismaArgs);

      // Праймим DataLoader userById — чтобы user(id) не шёл в БД заново
      users.forEach((u: any) => {
        loaders.userById.prime(u.id, u);
      });

      return users;
    },
  },

  // GET /users/:id  →  user(id: UUID!): User
  user: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    async resolve(
      _src: unknown,
      args: { id: string },
      { loaders, prisma }: GqlContext,
    ) {
      const id = args.id;

      // Сначала пробуем взять из кеша DataLoader (мог быть запраймен в users)
      const fromLoader = await loaders.userById.load(id);
      if (fromLoader) return fromLoader;

      // Если нет в кеше — обычный findUnique
      return prisma.user.findUnique({
        where: { id },
      });
    },
  },
};

export const mutationFields = {
  createUser: {
    type: new GraphQLNonNull(UserType),
    args: {
      dto: { type: new GraphQLNonNull(CreateUserInputType) },
    },
    resolve: async (_src, args, context: GqlContext) => {
      const { name, balance } = args.dto;
      return context.prisma.user.create({
        data: { name, balance },
      });
    },
  },

  changeUser: {
    type: new GraphQLNonNull(UserType),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeUserInputType) },
    },
    resolve: async (_src, args, context: GqlContext) => {
      return context.prisma.user.update({
        where: { id: args.id as string },
        data: args.dto,
      });
    },
  },

  deleteUser: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }: GqlContext) => {
      const deleted = await prisma.user.delete({
        where: { id: args.id as string },
      });
      return deleted.id;
    },
  },

  subscribeTo: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }: GqlContext) => {
      await prisma.subscribersOnAuthors.create({
        data: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });
      return 'OK';
    },
  },

  unsubscribeFrom: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }: GqlContext) => {
      await prisma.subscribersOnAuthors.deleteMany({
        where: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });
      return 'OK';
    },
  },
};
