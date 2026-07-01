import { prisma } from '../src';

/** Idempotent demo dataset (blueprint §3 — Demo dataset baseline generation). */
async function main() {
  const apparel = await prisma.category.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: { name: 'Apparel', slug: 'apparel' },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories' },
  });

  const products = [
    {
      name: 'Classic Tee',
      slug: 'classic-tee',
      description: '100% organic cotton crew-neck t-shirt.',
      priceCents: 2500,
      stock: 120,
      categoryId: apparel.id,
    },
    {
      name: 'Merino Hoodie',
      slug: 'merino-hoodie',
      description: 'Lightweight merino wool hoodie for all seasons.',
      priceCents: 8900,
      stock: 45,
      categoryId: apparel.id,
    },
    {
      name: 'Denim Jacket',
      slug: 'denim-jacket',
      description: 'Vintage-wash denim jacket with a relaxed fit.',
      priceCents: 12000,
      stock: 30,
      categoryId: apparel.id,
    },
    {
      name: 'Leather Belt',
      slug: 'leather-belt',
      description: 'Full-grain leather belt with a brushed steel buckle.',
      priceCents: 4500,
      stock: 80,
      categoryId: accessories.id,
    },
    {
      name: 'Canvas Tote',
      slug: 'canvas-tote',
      description: 'Heavyweight canvas tote bag with reinforced handles.',
      priceCents: 3200,
      stock: 200,
      categoryId: accessories.id,
    },
    {
      name: 'Knit Beanie',
      slug: 'knit-beanie',
      description: 'Soft ribbed-knit beanie in a neutral colourway.',
      priceCents: 1800,
      stock: 150,
      categoryId: accessories.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: {
        ...product,
        currency: 'usd',
        imageUrl: `https://picsum.photos/seed/${product.slug}/600/600`,
      },
    });
  }

  const count = await prisma.product.count();
  console.log(`Seed complete — ${count} products across 2 categories.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
