// src/routes/graphql/profiles/types.ts
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberTypeGraphQLType } from '../member-types/types.js';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },

    // в GraphQL-схеме userId нет, но в объекте из БД оно есть
    memberType: {
      type: new GraphQLNonNull(MemberTypeGraphQLType),
      resolve: async (profile: any, _args, { prisma }) => {
        const mt = await prisma.memberType.findUnique({
          where: { id: profile.memberTypeId },
        });
        if (!mt) {
          throw new Error('MemberType not found');
        }
        return mt;
      },
    },
  },
});
