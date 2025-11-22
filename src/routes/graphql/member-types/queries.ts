// src/routes/graphql/member-types/queries.ts
import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

import {
  MemberTypeGraphQLType,
  MemberTypeIdEnumType,
} from './types.js';

export const queryFields = {
  memberTypes: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(MemberTypeGraphQLType)),
    ),
    resolve: (_src, _args, { prisma }) => {
      return prisma.memberType.findMany();
    },
  },

  memberType: {
    type: MemberTypeGraphQLType,
    args: {
      // строго как в schema.graphql: MemberTypeId!
      id: { type: new GraphQLNonNull(MemberTypeIdEnumType) },
    },
    resolve: async (_src, args, { prisma }) => {
      const memberType = await prisma.memberType.findUnique({
        where: { id: args.id }, // 'BASIC' | 'BUSINESS'
      });

      // если не нашли — просто null (это ок)
      return memberType ?? null;
    },
  },
};

export const mutationFields = {};
