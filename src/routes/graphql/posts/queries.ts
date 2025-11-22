// src/routes/graphql/posts/queries.ts
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';

import { PostType } from './types.js';
import { UUIDType } from '../types/uuid.js';
import {
  CreatePostInputType,
  ChangePostInputType,
} from './inputs.js';

export const queryFields = {
  posts: {
    type: new GraphQLNonNull(
      new GraphQLList(new GraphQLNonNull(PostType)),
    ),
    resolve: (_src, _args, { prisma }) => {
      // REST: prisma.post.findMany()
      return prisma.post.findMany();
    },
  },

  post: {
    type: PostType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
      // REST: prisma.post.findUnique({ where: { id: ... } })
      const post = await prisma.post.findUnique({
        where: { id: args.id as string },
      });
      return post; // для несуществующего id → null, тесту ок
    },
  },
};

export const mutationFields = {
  // createPost(dto: CreatePostInput!): Post!
  createPost: {
    type: new GraphQLNonNull(PostType),
    args: {
      dto: { type: new GraphQLNonNull(CreatePostInputType) },
    },
    resolve: (_src, args, { prisma }) => {
      const { title, content, authorId } = args.dto;
      return prisma.post.create({
        data: { title, content, authorId },
      });
    },
  },

  // changePost(id: UUID!, dto: ChangePostInput!): Post!
  changePost: {
    type: new GraphQLNonNull(PostType),
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangePostInputType) },
    },
    resolve: (_src, args, { prisma }) => {
      const { id, dto } = args;

      const data: Record<string, unknown> = {};
      if (dto.title !== undefined) data.title = dto.title;
      if (dto.content !== undefined) data.content = dto.content;

      return prisma.post.update({
        where: { id: id as string },
        data,
      });
    },
  },

  // deletePost(id: UUID!): String!
  deletePost: {
    type: new GraphQLNonNull(GraphQLString), // schema.graphql: String!
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
      const deleted = await prisma.post.delete({
        where: { id: args.id as string },
      });
      return deleted.id; // просто возвращаем id — это truthy String
    },
  },
};
