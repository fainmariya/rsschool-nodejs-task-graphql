import { GraphQLNonNull } from 'graphql';
import { PrismaStatsType } from './types.js';

export const queryFields = {
  prismaStats: {
    type: new GraphQLNonNull(PrismaStatsType),
    resolve: (_src, _args, context: any) => {
      // тут context тот же, что и в остальных резолверах (с prisma и т.д.)
      return context.prismaStats;
    },
  },
};

export const mutationFields = {};