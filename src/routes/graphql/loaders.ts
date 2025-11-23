// src/routes/graphql/loaders.ts
import DataLoader from 'dataloader';
import type { PrismaClient } from '@prisma/client';

type Prisma = PrismaClient | any;

// 1. User по id
function createUserByIdLoader(prisma: Prisma) {
  return new DataLoader<string, any>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
    });

    const map = new Map<string, any>();
    for (const user of users) {
      map.set(user.id, user);
    }

    return ids.map((id) => map.get(id) ?? null);
  });
}

// 2. Подписки (строки из subscribersOnAuthors) по userId
function createSubsByUserIdLoader(prisma: Prisma) {
  return new DataLoader<string, any[]>(async (userIds) => {
    const subs = await prisma.subscribersOnAuthors.findMany({
      where: {
        OR: [
          { subscriberId: { in: userIds as string[] } },
          { authorId: { in: userIds as string[] } },
        ],
      },
    });

    const map = new Map<string, any[]>();
    for (const id of userIds) {
      map.set(id, []);
    }

    for (const row of subs) {
      // кладём строку и по subscriberId, и по authorId
      const sList = map.get(row.subscriberId);
      if (sList) sList.push(row);

      const aList = map.get(row.authorId);
      if (aList) aList.push(row);
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

// 3. Профиль по userId
function createProfileByUserIdLoader(prisma: Prisma) {
  return new DataLoader<string, any | null>(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds as string[] } },
    });

    const map = new Map<string, any>();
    for (const p of profiles) {
      map.set(p.userId, p);
    }

    return userIds.map((id) => map.get(id) ?? null);
  });
}

// 4. Посты по authorId
function createPostsByAuthorIdLoader(prisma: Prisma) {
  return new DataLoader<string, any[]>(async (authorIds) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds as string[] } },
    });

    const map = new Map<string, any[]>();
    for (const id of authorIds) {
      map.set(id, []);
    }

    for (const post of posts) {
      const list = map.get(post.authorId);
      if (list) list.push(post);
    }

    return authorIds.map((id) => map.get(id) ?? []);
  });
}

// 5. MemberType по id (BASIC/BUSINESS)
function createMemberTypeByIdLoader(prisma: Prisma) {
  return new DataLoader<string, any | null>(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: ids as string[] } },
    });

    const map = new Map<string, any>();
    for (const mt of memberTypes) {
      map.set(mt.id, mt);
    }

    return ids.map((id) => map.get(id) ?? null);
  });
}

export type Loaders = {
  userById: DataLoader<string, any>;
  subsByUserId: DataLoader<string, any[]>;
  profileByUserId: DataLoader<string, any | null>;
  postsByAuthorId: DataLoader<string, any[]>;
  memberTypeById: DataLoader<string, any | null>;
};

export function createLoaders(prisma: Prisma): Loaders {
  return {
    userById: createUserByIdLoader(prisma),
    subsByUserId: createSubsByUserIdLoader(prisma),
    profileByUserId: createProfileByUserIdLoader(prisma),
    postsByAuthorId: createPostsByAuthorIdLoader(prisma),
    memberTypeById: createMemberTypeByIdLoader(prisma),
  };
}
