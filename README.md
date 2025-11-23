# GraphQL Basics Service

Educational project for the RS School Node.js course.  
This service exposes both REST and GraphQL APIs over the same data model (users, posts, profiles, member types, subscriptions).

The goal of the GraphQL part is:

- Reproduce REST logic as GraphQL schema and resolvers
- Add depth limiting for GraphQL queries
- Solve the N+1 problem using DataLoader
- Implement subscription relations between users (followers / following)

---

## Tech Stack

- **Node.js** `>= 24.x`
- **TypeScript**
- **Fastify**
- **GraphQL** (`graphql`)
- **Prisma** (SQLite)
- **DataLoader**
- **graphql-depth-limit**
- Testing: **tap**

---

## Getting Started

### 1. Install dependencies

```bash
npm ci


### Tests
#### GraphQL basic behavior
npm run test-queries
npm run test-mutations

####Depth limit rule
npm run test-rule

####DataLoader behavior
npm run test-loader

####DataLoader + Prime (subscriptions)
npm run test-loader-prime

