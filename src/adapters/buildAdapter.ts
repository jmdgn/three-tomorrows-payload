import { DatabaseAdapter } from 'payload/database';

/**
 * A mock database adapter for build time that doesn't actually connect to MongoDB
 */
export const createMockAdapter = (): DatabaseAdapter => {
  return {
    connect: async () => {
      console.log('Using mock database adapter for build');
      return Promise.resolve();
    },
    collections: {
      find: async () => [],
      findOne: async () => null,
      create: async () => ({}),
      updateOne: async () => ({}),
      deleteOne: async () => ({}),
      aggregate: async () => [],
      // Add other required methods here
    },
    // Other required methods
    findMany: async () => [],
    findOne: async () => null,
    findVersions: async () => ({ docs: [], totalDocs: 0, totalPages: 0, page: 1 }),
    createGlobal: async () => ({}),
    createOne: async () => ({}),
    deleteMany: async () => {},
    deleteOne: async () => {},
    destroy: async () => {},
    findGlobal: async () => null,
    findGlobalVersions: async () => ({ docs: [], totalDocs: 0, totalPages: 0, page: 1 }),
    findManyVersions: async () => ({ docs: [], totalDocs: 0, totalPages: 0, page: 1 }),
    init: async () => {},
    queryDrafts: async () => ({ docs: [], totalDocs: 0, totalPages: 0, page: 1 }),
    updateGlobal: async () => ({}),
    updateGlobalVersion: async () => {},
    updateMany: async () => ({}),
    updateOne: async () => ({}),
    updateVersion: async () => {},
  };
};