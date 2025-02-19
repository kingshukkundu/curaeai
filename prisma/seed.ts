import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo users
  const hashedPassword = await bcrypt.hash('doctor123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create doctor user
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@demo.com' },
    update: {},
    create: {
      email: 'doctor@demo.com',
      name: 'Dr. John Smith',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  });

  // Create patient user
  const patient = await prisma.user.upsert({
    where: { email: 'patient@demo.com' },
    update: {},
    create: {
      email: 'patient@demo.com',
      name: 'Jane Doe',
      password: patientPassword,
      role: 'PATIENT',
      patientProfile: {
        create: {
          dateOfBirth: new Date('1990-01-01'),
          bloodGroup: 'O+',
          allergies: 'None',
        },
      },
    },
  });

  console.log({ admin, doctor, patient });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
