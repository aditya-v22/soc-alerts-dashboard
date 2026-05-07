import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcrypt';
import { generateAlerts } from '../scripts/generate-alerts';

dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL!;
  const resolvedUrl = dbUrl.startsWith('file:./')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:./', ''))}`
    : dbUrl;

  const adapter = new PrismaLibSql({ url: resolvedUrl });
  const prisma = new PrismaClient({ adapter } as any);

  console.log('Seeding database...');

  await prisma.alert.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('DefenderM8!', 10);
  await prisma.user.create({
    data: {
      email: 'analyst@defendermate.local',
      username: 'analyst',
      password: hashedPassword,
    },
  });

  console.log('Created analyst user');

  const alerts = generateAlerts(1000);
  const batchSize = 100;

  for (let i = 0; i < alerts.length; i += batchSize) {
    const batch = alerts.slice(i, i + batchSize);
    await prisma.alert.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + batchSize, alerts.length)} / ${alerts.length} alerts`);
  }

  console.log('Seeding complete.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
