import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with local WhatsApp Image products...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const seller = await prisma.user.upsert({
    where: { username: 'official_store' },
    update: {},
    create: {
      username: 'official_store',
      email: 'store@eyewear.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Clear existing products to "delete all glasses currently in the seed"
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});

  const uploadDir = path.join(__dirname, '../public/uploads');
  const files = fs.readdirSync(uploadDir).filter(f => f.startsWith('WhatsApp Image'));

  const brands = ['Ray-Ban', 'Prada', 'Oliver Peoples', 'Emporio Armani', 'Brunello Cucinelli'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];

  const products = files.map((filename, index) => {
    const brand = brands[index % brands.length];
    const gender = genders[index % genders.length];
    const price = 1000000 + Math.floor(Math.random() * 5000000); // Random price between 1M and 6M

    return {
      name: `${brand} Special Edition ${index + 1}`,
      description: `Premium sunglasses from ${brand}. Features iconic design and high quality lenses. Ideal for ${gender}.`,
      price: price,
      stock: 50,
      sku: `WA-${String(index + 1).padStart(3, '0')}`,
      category: brand,
      gender: gender,
      images: JSON.stringify([filename])
    };
  });

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        sellerId: seller.username,
      },
    });
  }

  console.log(`Seeding completed successfully! Inserted ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
