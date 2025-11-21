import {
    GraphQLNonNull,
    GraphQLList,
    GraphQLID,
    GraphQLString,
    GraphQLFloat,
  } from 'graphql';
  
  import { UserType } from './types.js';
  import {
    CreateUserInputType,
    ChangeUserInputType,
  } from './inputs.js';
  
  import { UUIDType } from '../types/uuid.js';
  // временно:
  type GqlContext = any;
  
  export const queryFields = {
    // users: [User!]!
    users: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UserType)),
      ),
      resolve: (
        _src: unknown,
        _args: unknown,
        { prisma }: GqlContext,
      ) => {
        // REST-аналог: prisma.user.findMany()
        return prisma.user.findMany();
      },
    },
  
    // user(id: UUID!): User
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: (
        _src: unknown,
        args: { id: string },
        { prisma }: GqlContext,
      ) => {
        // REST-аналог: prisma.user.findUnique({ where: { id } })
        return prisma.user.findUnique({
          where: { id: args.id },
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
      resolve: (_src, args, context) => {
        const { name, balance } = args.dto;
        return context.prisma.user.create({ data: { name, balance } });
      },
    },
  
    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) },
      },
      resolve: (_src, args, context) => {
        return context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },
  };
  