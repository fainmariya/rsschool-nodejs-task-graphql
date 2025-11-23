import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import {
  queryFields as memberTypeQueryFields,
  mutationFields as memberTypeMutationFields,
} from './member-types/queries.js';

import {
  queryFields as postsQueryFields,
  mutationFields as postsMutationFields,
} from './posts/queries.js';

import {
  queryFields as profilesQueryFields,
  mutationFields as profilesMutationFields,
} from './profiles/queries.js';

import {
  queryFields as statsQueryFields,
  mutationFields as statsMutationFields,
} from './stats/queries.js';

import {
  queryFields as usersQueryFields,
  mutationFields as usersMutationFields,
} from './users/queries.js';

// Корневой Query должен называться RootQueryType (как в schema.graphql)
const QueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...memberTypeQueryFields,
    ...postsQueryFields,
    ...profilesQueryFields,
    ...statsQueryFields,
    ...usersQueryFields,
  },
});


const MutationType = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    ...memberTypeMutationFields,
    ...postsMutationFields,
    ...profilesMutationFields,
    ...statsMutationFields,
    ...usersMutationFields,
  },
});

// Итоговая схема, которую мы используем в index.ts
export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
