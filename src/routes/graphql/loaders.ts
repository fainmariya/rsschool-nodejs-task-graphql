import DataLoader from 'dataloader';
import type { PrismaClient } from '@prisma/client';

type Prisma = PrismaClient | any;

// User по id
function createUserByIdLoader(prisma: Prisma) {
  return new DataLoader<string, any>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: ids as string[] },
      },
    });

    const map = new Map<string, any>();
    for (const user of users) {
      map.set(user.id, user);
    }

    return ids.map((id) => map.get(id) ?? null);
  });
}

function createSubsByUserIdLoader(prisma: Prisma) {
  return new DataLoader<string, any[]>(async (userIds) => {
  
    const subs = await prisma.sub.findMany({
      where: {
        userId: { in: userIds as string[] },
      },
    });

    const map = new Map<string, any[]>();
    for (const userId of userIds) {
      map.set(userId, []);
    }

    for (const sub of subs) {
      const list = map.get(sub.userId);
      if (list) list.push(sub);
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export type Loaders = {
  userById: DataLoader<string, any>;
  subsByUserId: DataLoader<string, any[]>;
};

export function createLoaders(prisma: Prisma): Loaders {
  return {
    userById: createUserByIdLoader(prisma),
    subsByUserId: createSubsByUserIdLoader(prisma),
  };
}