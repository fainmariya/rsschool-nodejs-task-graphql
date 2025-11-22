// src/routes/graphql/profiles/types.ts
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberTypeGraphQLType } from '../member-types/types.js';
import type { Loaders } from '../loaders.js';

type GqlContext = {
  prisma: any;
  loaders: Loaders;
};

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },

    memberType: {
      type: new GraphQLNonNull(MemberTypeGraphQLType),
      resolve: async (profile: any, _args, { loaders }: GqlContext) => {
        const mt = await loaders.memberTypeById.load(profile.memberTypeId);
        if (!mt) {
          throw new Error('MemberType not found');
        }
        return mt;
      },
    },
  },
});
