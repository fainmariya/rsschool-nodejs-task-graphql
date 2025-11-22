// src/routes/graphql/users/queries.ts
import {
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { UserType } from './types.js';
import {
  CreateUserInputType,
  ChangeUserInputType,
} from './inputs.js';

type GqlContext = {
  prisma: any;
};

// === QUERY ===
// users: [User!]!
// user(id: UUID!): User
export const queryFields = {
  users: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(UserType)),
    ),
    resolve: (_src: unknown, _args: unknown, { prisma }: GqlContext) => {
      return prisma.user.findMany();
    },
  },

  user: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) }, // ВАЖНО: UUID, не GraphQLID
    },
    resolve: (
      _src: unknown,
      args: { id: string },
      { prisma }: GqlContext,
    ) => {
      return prisma.user.findUnique({
        where: { id: args.id },
      });
    },
  },
};

// === MUTATION ===
// Для test-queries достаточно, чтобы объект mutationFields существовал.
// Можно заполнить корректно наперёд.

export const mutationFields = {
  // createUser(dto: CreateUserInput!): User!
  createUser: {
    type: new GraphQLNonNull(UserType),
    args: {
      dto: { type: new GraphQLNonNull(CreateUserInputType) },
    },
    resolve: (
      _src: unknown,
      args: { dto: { name: string; balance: number } },
      { prisma }: GqlContext,
    ) => {
      const { name, balance } = args.dto;
      return prisma.user.create({
        data: { name, balance },
      });
    },
  },

  // changeUser(id: UUID!, dto: ChangeUserInput!): User!
  changeUser: {
    type: new GraphQLNonNull(UserType),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeUserInputType) },
    },
    resolve: (
      _src: unknown,
      args: {
        id: string;
        dto: { name?: string; balance?: number };
      },
      { prisma }: GqlContext,
    ) => {
      return prisma.user.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },

  // deleteUser(id: UUID!): String!
  deleteUser: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (
      _src: unknown,
      args: { id: string },
      { prisma }: GqlContext,
    ) => {
      await prisma.user.delete({
        where: { id: args.id },
      });
      return 'OK';
    },
  },

  // subscribeTo(userId: UUID!, authorId: UUID!): String!
  subscribeTo: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (
      _src: unknown,
      args: { userId: string; authorId: string },
      { prisma }: GqlContext,
    ) => {
      // здесь имя модели/sub-таблицы нужно будет подстроить под prisma.schema,
      // но для test-queries это ещё не критично
      await prisma.subscription.create({
        data: {
          userId: args.userId,
          authorId: args.authorId,
        },
      });
      return 'OK';
    },
  },

  // unsubscribeFrom(userId: UUID!, authorId: UUID!): String!
  unsubscribeFrom: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (
      _src: unknown,
      args: { userId: string; authorId: string },
      { prisma }: GqlContext,
    ) => {
      await prisma.subscription.delete({
        where: {
          userId_authorId: {
            userId: args.userId,
            authorId: args.authorId,
          },
        },
      });
      return 'OK';
    },
  },
};
