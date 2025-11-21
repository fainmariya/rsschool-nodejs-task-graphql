// src/routes/graphql/profiles/inputs.ts
import {
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInt,
  } from 'graphql';
  import { UUIDType } from '../types/uuid.js';
  import { MemberTypeIdEnumType } from '../member-types/types.js';
  
  // input CreateProfileInput {
  //   isMale: Boolean!
  //   yearOfBirth: Int!
  //   userId: UUID!
  //   memberTypeId: MemberTypeId!
  // }
  export const CreateProfileInputType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: {
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: {
        type: new GraphQLNonNull(MemberTypeIdEnumType),
      },
    },
  });
  
  // input ChangeProfileInput {
  //   isMale: Boolean
  //   yearOfBirth: Int
  //   memberTypeId: MemberTypeId
  // }
  export const ChangeProfileInputType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: {
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      memberTypeId: { type: MemberTypeIdEnumType },
    },
  });
  