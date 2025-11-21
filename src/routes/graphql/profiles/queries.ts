import {
    GraphQLList,
    GraphQLString,
    GraphQLNonNull,
    GraphQLID,
    GraphQLBoolean,
    GraphQLInt,
  } from 'graphql';
  
  import { ProfileType } from './types.js';
  import { UUIDType } from '../types/uuid.js';
  import { MemberTypeIdEnumType } from '../member-types/types.js';
  import {
    CreateProfileInputType,
    ChangeProfileInputType,
  } from './inputs.js';
  
  export const queryFields = {
    // GET /profiles
    profiles: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(ProfileType)),
      ),
      resolve: (_src, _args, { prisma }) => {
       
        return prisma.profile.findMany();
      },
    },
  
    // GET /profiles/:profileId
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (_src, args, { prisma }) => {
        const profile = await prisma.profile.findUnique({
          where: { id: args.id as string },
        });
      
        return profile;
      },
    },
  };
  
  export const mutationFields = {
    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputType) },
      },
      resolve: (_src, args, { prisma }) => {
        const { isMale, yearOfBirth, userId, memberTypeId } = args.dto;
  
        return prisma.profile.create({
          data: {
            isMale,
            yearOfBirth,
            userId,
            memberTypeId,
          },
        });
      },
    },
  
    // PATCH /profiles/:profileId
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
      },
      resolve: (_src, args, { prisma }) => {
        return prisma.profile.update({
          where: { id: args.id as string },
          data: args.dto,
        });
      },
    },
  
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_src, args, { prisma }) => {
        await prisma.profile.delete({
          where: { id: args.id as string },
        });
        return 'OK';
      },
    },
  };