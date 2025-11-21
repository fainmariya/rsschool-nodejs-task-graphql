import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLString,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    
  },
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});