import {
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { PostType } from './types.js';
import { UUIDType } from '../types/uuid.js';

export const queryFields = {
  // posts: [Post!]!
  posts: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(PostType)),
    ),
    resolve: (_src, _args, { prisma }) => {
      return prisma.post.findMany(); // ВАЖНО: post, не posts
    },
  },

  // post(id: UUID!): Post
  post: {
    type: PostType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
      const post = await prisma.post.findUnique({
        where: { id: args.id as string },
      });
      // для несуществующего id → null (это ОК для схемы)
      return post;
    },
  },
};

export const mutationFields = {
  
};
