// src/routes/graphql/profiles/queries.ts
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { ProfileType } from './types.js';
import {
  CreateProfileInputType,
  ChangeProfileInputType,
} from './inputs.js';

type GqlContext = { prisma: any };

export const queryFields = {
  // profiles: [Profile!]!
  profiles: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(ProfileType)),
    ),
    resolve: (_src: unknown, _args: unknown, { prisma }: GqlContext) => {
      return prisma.profile.findMany();
    },
  },

  // profile(id: UUID!): Profile
  profile: {
    type: ProfileType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) }, // ВАЖНО: UUID!
    },
    resolve: (
      _src: unknown,
      args: { id: string },
      { prisma }: GqlContext,
    ) => {
      return prisma.profile.findUnique({
        where: { id: args.id },
      });
    },
  },
};

export const mutationFields = {
  // createProfile(dto: CreateProfileInput!): Profile!
  createProfile: {
    type: new GraphQLNonNull(ProfileType),
    args: {
      dto: { type: new GraphQLNonNull(CreateProfileInputType) },
    },
    resolve: (
      _src: unknown,
      args: {
        dto: {
          isMale: boolean;
          yearOfBirth: number;
          userId: string;
          memberTypeId: string;
        };
      },
      { prisma }: GqlContext,
    ) => {
      const { isMale, yearOfBirth, userId, memberTypeId } = args.dto;
      return prisma.profile.create({
        data: { isMale, yearOfBirth, userId, memberTypeId },
      });
    },
  },

  // changeProfile(id: UUID!, dto: ChangeProfileInput!): Profile!
  changeProfile: {
    type: new GraphQLNonNull(ProfileType),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
    },
    resolve: (
      _src: unknown,
      args: {
        id: string;
        dto: { isMale?: boolean; yearOfBirth?: number; memberTypeId?: string };
      },
      { prisma }: GqlContext,
    ) => {
      return prisma.profile.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },

  // deleteProfile(id: UUID!): String!
  deleteProfile: {
    type: new GraphQLNonNull(GraphQLString),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
      const deleted = await prisma.profile.delete({
        where: { id: args.id as string },
      });
      return deleted.id;
    },
  },
};
