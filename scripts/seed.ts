import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      email: 'doctor@example.com',
      name: 'Dr. Smith',
      password: doctorPassword,
      role: 'DOCTOR',
    },
  });

  // Create patient user
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      name: 'John Doe',
      password: patientPassword,
      role: 'PATIENT',
      patientProfile: {
        create: {
          dateOfBirth: new Date('1990-01-01'),
          bloodGroup: 'O+',
        },
      },
    },
  });

  console.log({ admin, doctor, patient });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
