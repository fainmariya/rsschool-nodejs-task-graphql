import {
  GraphQLNonNull,
  GraphQLList,
  GraphQLString
} from 'graphql';

import { UUIDType } from '../types/uuid.js';
import { UserType } from './types.js';
import {
  CreateUserInputType,
  ChangeUserInputType,
} from './inputs.js';

type GqlContext = any;

export const queryFields = {
  users: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(UserType)),
    ),
    resolve: (_src, _args, context: GqlContext) => {
      return context.prisma.user.findMany();
    },
  },

  user: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
  
    resolve: async (_src, args, context: GqlContext) => {
      console.log('GQL user resolver args:', args);

      const result = await context.prisma.user.findUnique({
        where: { id: args.id as string },
      });

      console.log('GQL user resolver result:', result);

      return result;
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
    resolve: async (_src, args, { prisma }) => {
      const deleted = await prisma.user.delete({
        where: { id: args.id as string },
      });
      return deleted.id;
    },
  },

  


  // subscribeTo(userId: UUID!, authorId: UUID!): String!
  subscribeTo: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
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
    resolve: async (_src, args, { prisma }) => {
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
