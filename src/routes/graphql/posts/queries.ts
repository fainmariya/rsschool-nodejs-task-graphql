import { GraphQLList,
         GraphQLNonNull,
         GraphQLString
} from "graphql"; 
 import { PostType } from "./types.js";
 import {UUIDType } from '../types/uuid.js';
 import { CreatePostInputType, ChangePostInputType } from './inputs.js';

 export const queryFields ={
    posts:{
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType)),
    ), 
    resolve:(_src, _args, { prisma })=>{
        return prisma.post.findMany();
    },
    },
    post:{
        type: PostType,
        args:{
            id: { type: new GraphQLNonNull(UUIDType)},
        },
        resolve: async(_src, args, {prisma}) =>{
            const post= await prisma.post.findUnique({
                where:{
                    id: args.id as string 
                },
            });
            return post;
        },

    },
 };
 export const mutationFields = {
  createPost: {
    type: new GraphQLNonNull(PostType),
    args: {
      dto: { type: new GraphQLNonNull(CreatePostInputType) },
    },
    resolve: (_src, args, { prisma }) => {
      const { title, content, authorId } = args.dto;

      return prisma.post.create({
        data: {
          title,
          content,
          authorId,
        },
      });
    },
  },
  
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

  // DELETE /posts/:postId
  deletePost: {
    type: new GraphQLNonNull(GraphQLString), 
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_src, args, { prisma }) => {
      const deleted = await prisma.post.delete({
        where: { id: args.id as string },
      });
  
      // Можно вернуть id как строку — это удовлетворяет Scalar String!
      return deleted.id;
    },
  },
};