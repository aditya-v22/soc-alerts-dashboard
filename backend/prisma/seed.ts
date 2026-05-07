import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateAlerts } from '../scripts/generate-alerts';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.user.deleteMany();

  // Create analyst user
  const hashedPassword = await bcrypt.hash('DefenderM8!', 10);
  await prisma.user.create({
    data: {
      email: 'analyst@defendermate.local',
      username: 'analyst',
      password: hashedPassword,
    },
  });

  console.log('Created analyst user');

  // Generate and insert alerts in batches
  const alerts = generateAlerts(1000);
  const batchSize = 100;

  for (let i = 0; i < alerts.length; i += batchSize) {
    const batch = alerts.slice(i, i + batchSize);
    await prisma.alert.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + batchSize, alerts.length)} / ${alerts.length} alerts`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
