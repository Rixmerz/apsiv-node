/**
 * Create Doctor User Script
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createDoctorUser() {
  try {
    console.log('Creating doctor user...');
    const prisma = new PrismaClient();

    // Create doctor user
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const doctorUser = await prisma.user.create({
      data: {
        email: 'doctor@example.com',
        password: hashedPassword,
        name: 'Dr. John Smith',
        role: 'doctor',
        doctorProfile: {
          create: {
            specialty: 'General Medicine',
            bio: 'Experienced doctor with over 10 years of practice.'
          }
        }
      },
      include: {
        doctorProfile: true
      }
    });
    
    console.log('Doctor user created:', doctorUser);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating doctor user:', error.message);
  }
}

createDoctorUser();
