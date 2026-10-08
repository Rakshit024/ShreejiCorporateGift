import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { seedCategories, seedHampers, seedProducts } from '../data/seedData.js';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { Product } from '../models/Product.js';
import { getSettings } from '../models/Setting.js';
import { User } from '../models/User.js';

const reset = process.argv.includes('--reset');

async function seedCategoriesAndProducts(): Promise<void> {
  const categoryIds = new Map<string, string>();

  for (const [index, category] of seedCategories.entries()) {
    const saved = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        $set: {
          name: category.name,
          description: category.description,
          icon: category.icon,
          order: category.order ?? index,
          isActive: true,
        },
        $setOnInsert: { slug: category.slug },
      },
      { upsert: true, returnDocument: 'after' },
    );
    categoryIds.set(category.id, String(saved._id));
  }

  for (const product of seedProducts) {
    const categoryId = categoryIds.get(product.categoryId);
    if (!categoryId) {
      throw new Error(`Seed product "${product.id}" references unknown category "${product.categoryId}"`);
    }
    const categoryName = seedCategories.find((c) => c.id === product.categoryId)?.name ?? '';

    await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          name: product.name,
          sku: product.id.toUpperCase(),
          categoryId,
          category: categoryName,
          priceFrom: product.priceFrom,
          description: product.description,
          shortDescription: product.shortDescription,
          image: product.image,
          images: [],
          featured: product.featured,
          customizable: product.customizable,
          bulkPricing: product.bulkPricing,
          available: product.available,
          printingOptions: product.printingOptions ?? [],
          pricingSlabs: product.pricingSlabs ?? [],
          specifications: product.specifications,
          tags: product.tags,
          stock: product.stock,
          lowStockThreshold: 5,
          minimumOrderQuantity: 1,
        },
        $setOnInsert: { slug: product.slug },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  console.log(`[seed] ${seedCategories.length} categories, ${seedProducts.length} products`);
  return;
}

async function seedAdmin(): Promise<void> {
  const existing = await User.findOne({ email: env.seed.adminEmail });
  if (existing) {
    console.log(`[seed] admin ${env.seed.adminEmail} already exists, skipping`);
    return;
  }
  await User.create({
    name: env.seed.adminName,
    email: env.seed.adminEmail,
    passwordHash: await bcrypt.hash(env.seed.adminPassword, 12),
    role: 'admin',
  });
  console.log(`[seed] created admin ${env.seed.adminEmail}`);
}

async function seedMarketing(): Promise<void> {
  await Coupon.findOneAndUpdate(
    { code: 'WELCOME10' },
    {
      $set: {
        description: '10% off a first bulk enquiry order.',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 2000,
        minimumOrderValue: 5000,
        minimumQuantity: 25,
        usageLimit: 500,
        perUserLimit: 1,
        isActive: true,
      },
      $setOnInsert: { code: 'WELCOME10' },
    },
    { upsert: true, returnDocument: 'after' },
  );

  await Coupon.findOneAndUpdate(
    { code: 'DIWALI2500' },
    {
      $set: {
        description: 'Flat ₹2,500 off festive hamper orders.',
        discountType: 'fixed',
        discountValue: 2500,
        minimumOrderValue: 15000,
        minimumQuantity: 50,
        isActive: false,
      },
      $setOnInsert: { code: 'DIWALI2500' },
    },
    { upsert: true, returnDocument: 'after' },
  );

  await Banner.findOneAndUpdate(
    { title: 'Corporate gifting, made effortless' },
    {
      $set: {
        subtitle: 'Branded bottles, pens, diaries and hampers with bulk pricing.',
        image: '/products/steel-bottle-750ml.svg',
        ctaLabel: 'Request a quote',
        ctaLink: '/quote',
        placement: 'home-hero',
        order: 0,
        isActive: true,
      },
      $setOnInsert: { title: 'Corporate gifting, made effortless' },
    },
    { upsert: true, returnDocument: 'after' },
  );

  console.log(`[seed] marketing data ready (${seedHampers.length} hamper presets available to the storefront)`);
}

async function run(): Promise<void> {
  await connectDatabase();

  if (reset) {
    console.log('[seed] --reset: clearing catalog, marketing and settings data');
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
    ]);
  }

  await seedAdmin();
  await seedCategoriesAndProducts();
  await seedMarketing();
  await getSettings();

  console.log('[seed] done');
  await disconnectDatabase();
}

run()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('[seed] failed:', error);
    process.exit(1);
  });