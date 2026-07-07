import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: "admin@civicvision.ai" },
    update: {},
    create: {
      email: "admin@civicvision.ai",
      // Placeholder hash for local dev seeding only — replace with a real
      // bcrypt hash once the auth module (hashing service) exists.
      passwordHash: "seed-placeholder-not-a-real-hash",
      fullName: "CivicVision Admin",
      role: Role.ADMIN,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
