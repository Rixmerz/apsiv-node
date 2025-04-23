/**
 * Verify Test Doctor Script
 * 
 * This script checks if the test doctor exists and creates it if not
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function verifyTestDoctor() {
  try {
    console.log('Verifying test doctor...');
    const prisma = new PrismaClient();

    // Check if test doctor exists
    const testDoctor = await prisma.user.findFirst({
      where: {
        email: 'doctor@example.com',
        role: 'doctor'
      },
      include: {
        doctorProfile: true
      }
    });

    if (testDoctor) {
      console.log('Test doctor already exists:', testDoctor.email);
    } else {
      console.log('Creating test doctor...');
      
      // Create test doctor
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const newDoctor = await prisma.user.create({
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
      
      console.log('Test doctor created:', newDoctor.email);
    }
    
    await prisma.$disconnect();
    console.log('Verification completed');
  } catch (error) {
    console.error('Error verifying test doctor:', error.message);
  }
}

verifyTestDoctor();
