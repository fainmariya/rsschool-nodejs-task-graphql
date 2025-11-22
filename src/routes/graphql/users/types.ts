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

    profile: {
      type: ProfileType,
      resolve: (user: any, _args, { prisma }) => {
        return prisma.profile.findUnique({
          where: { userId: user.id },
        });
      },
    },

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
// На кого этот пользователь подписан
userSubscribedTo: {
  type: new GraphQLNonNull(
    new GraphQLList(new GraphQLNonNull(UserType)),
  ),
  resolve: async (user: any, _args, { prisma }) => {
    // 1. Все записи, где ЭТОТ user — подписчик (subscriber)
    const subs = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: user.id },
    });

    if (!subs.length) return [];

    // 2. Собираем id авторов, на которых он подписан
    const authorIds = subs.map((s: any) => s.authorId);

    // 3. Грузим всех этих авторов одним запросом
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
    });

    // 4. Мапа по id
    const byId = new Map<string, any>();
    for (const author of authors) {
      byId.set(author.id, author);
    }

    // 5. Возвращаем пользователей в том же порядке, фильтруя пустые
    return authorIds
      .map((id: string) => byId.get(id))
      .filter((u): u is any => Boolean(u));
  },
},

// subscribedToUser: [User!]!
// Кто подписан на этого пользователя
subscribedToUser: {
  type: new GraphQLNonNull(
    new GraphQLList(new GraphQLNonNull(UserType)),
  ),
  resolve: async (user: any, _args, { prisma }) => {
    // 1. Все записи, где ЭТОТ user — автор
    const subs = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: user.id },
    });

    if (!subs.length) return [];

    // 2. Собираем id подписчиков
    const subscriberIds = subs.map((s: any) => s.subscriberId);

    // 3. Грузим всех подписчиков
    const subscribers = await prisma.user.findMany({
      where: { id: { in: subscriberIds } },
    });

    const byId = new Map<string, any>();
    for (const u of subscribers) {
      byId.set(u.id, u);
    }

    return subscriberIds
      .map((id: string) => byId.get(id))
      .filter((u): u is any => Boolean(u));
  },
},


  }),
});
