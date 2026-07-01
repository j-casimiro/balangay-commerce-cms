import {
  Global,
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { prisma } from '@cms/database';
import type { PrismaClient } from '@cms/database';

/** DI token for the shared Prisma client (blueprint §4.I — single origin). */
export const PRISMA_CLIENT = 'PRISMA_CLIENT';

@Global()
@Module({
  providers: [{ provide: PRISMA_CLIENT, useValue: prisma }],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  // Inject via the token (rather than the imported singleton) so tests can
  // override PRISMA_CLIENT with a mock and this lifecycle targets that mock.
  constructor(
    @Inject(PRISMA_CLIENT) private readonly client: PrismaClient,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
