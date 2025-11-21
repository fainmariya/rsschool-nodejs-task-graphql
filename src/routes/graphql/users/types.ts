// src/routes/graphql/users/types.ts
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { ProfileType } from '../profiles/types.js';
import { PostType } from '../posts/types.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },

    // profile: Profile
    profile: {
      type: ProfileType,
      resolve: (user: any, _args, { prisma }) => {
        return prisma.profile.findUnique({
          where: { userId: user.id },
        });
      },
    },

    // posts: [Post!]!
    posts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(PostType)),
      ),
      resolve: (user: any, _args, { prisma }) => {
        return prisma.post.findMany({
          where: { authorId: user.id },
        });
      },
    },

    // userSubscribedTo: [User!]!
    userSubscribedTo: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UserType)),
      ),
      resolve: async (user: any, _args, { prisma }) => {
        const full = await prisma.user.findUnique({
          where: { id: user.id },
          include: { userSubscribedTo: true }, // поле должно совпадать с Prisma-моделью
        });
        return full?.userSubscribedTo ?? [];
      },
    },

    // subscribedToUser: [User!]!
    subscribedToUser: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UserType)),
      ),
      resolve: async (user: any, _args, { prisma }) => {
        const full = await prisma.user.findUnique({
          where: { id: user.id },
          include: { subscribedToUser: true },
        });
        return full?.subscribedToUser ?? [];
      },
    },
  }),
});
