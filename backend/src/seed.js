const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const analystPassword = await bcrypt.hash('analyst123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: adminPassword,
      role: 'Admin'
    }
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {},
    create: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: analystPassword,
      role: 'Analyst'
    }
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: viewerPassword,
      role: 'Viewer'
    }
  });

  console.log('Created users:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  await prisma.record.deleteMany();

  const categories = ['Salary', 'Investment', 'Business', 'Rent', 'Utilities', 'Food', 'Transport', 'Entertainment'];
  const types = ['income', 'expense'];

  const records = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    const type = types[Math.floor(Math.random() * types.length)];
    const category = type === 'income' 
      ? categories[Math.floor(Math.random() * 3)]
      : categories[3 + Math.floor(Math.random() * 5)];
    
    records.push({
      userId: [admin.id, analyst.id][Math.floor(Math.random() * 2)],
      amount: type === 'income' ? Math.floor(Math.random() * 10000) + 1000 : Math.floor(Math.random() * 2000) + 100,
      type,
      category,
      date,
      notes: `Transaction ${i + 1}`
    });
  }

  await prisma.record.createMany({ data: records });

  console.log('Created 50 random records');
  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
