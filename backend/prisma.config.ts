import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});