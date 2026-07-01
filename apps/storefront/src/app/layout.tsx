import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Balangay Commerce CMS Storefront',
  description: 'e-commerce storefront powered by Next.js + NestJS + Prisma.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
