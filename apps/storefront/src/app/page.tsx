import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Headless E-Commerce CMS
      </h1>
      <p className="text-muted-foreground">
        A Next.js storefront wired to a NestJS + Prisma admin API. This starter
        ships a working Products vertical slice end to end.
      </p>
      <Link href="/products">
        <Button size="lg">Browse products</Button>
      </Link>
    </main>
  );
}
