import {
    GraphQLObjectType,
    GraphQLEnumType,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt,
  } from 'graphql';
  
  export const MemberTypeIdEnumType = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });
  export const MemberTypeGraphQLType = new GraphQLObjectType({
    name: 'MemberType',
    fields: {
      id: { type: new GraphQLNonNull(MemberTypeIdEnumType) }, // норм: "BASIC" / "BUSINESS"
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    },
  });