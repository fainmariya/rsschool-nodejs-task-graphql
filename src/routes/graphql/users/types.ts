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
import type { Loaders } from '../loaders.js';

type GqlContext = {
  prisma: any;
  loaders: Loaders;
};

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },

    profile: {
      type: ProfileType,
      resolve: (user: any, _args, { loaders }: GqlContext) => {
        return loaders.profileByUserId.load(user.id);
      },
    },

    posts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(PostType)),
      ),
      resolve: (user: any, _args, { loaders }: GqlContext) => {
        return loaders.postsByAuthorId.load(user.id);
      },
    },

    userSubscribedTo: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UserType)),
      ),
      resolve: async (user: any, _args, { loaders }: GqlContext) => {
        const subs = await loaders.subsByUserId.load(user.id);
        const authorIds = subs
          .filter((row) => row.subscriberId === user.id)
          .map((row) => row.authorId as string);

        if (authorIds.length === 0) {
          return [];
        }

        const authors = await loaders.userById.loadMany(authorIds);
        return authors.filter(Boolean);
      },
    },

    subscribedToUser: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(UserType)),
      ),
      resolve: async (user: any, _args, { loaders }: GqlContext) => {
        const subs = await loaders.subsByUserId.load(user.id);
        const subscriberIds = subs
          .filter((row) => row.authorId === user.id)
          .map((row) => row.subscriberId as string);

        if (subscriberIds.length === 0) {
          return [];
        }

        const subscribers = await loaders.userById.loadMany(subscriberIds);
        return subscribers.filter(Boolean);
      },
    },
  }),
});
