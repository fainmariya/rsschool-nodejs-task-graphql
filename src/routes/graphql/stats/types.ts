import {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLList,
    GraphQLString,
    GraphQLID,
  } from 'graphql';

  export const PrismaOperationType = new GraphQLObjectType({
    name: 'PrismaOperation',
    fields: {
      model: { type: new GraphQLNonNull(GraphQLString) },
      operation: { type: new GraphQLNonNull(GraphQLString) },
  
      args: { type: GraphQLString },
    },
  });
  
 
  export const PrismaStatsType = new GraphQLObjectType({
    name: 'PrismaStats',
    fields: {
      operationHistory: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(PrismaOperationType)),
        ),
      },
    },
  });