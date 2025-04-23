/**
 * Update Patient User Script
 */
const { PrismaClient } = require('@prisma/client');

async function updatePatientUser() {
  try {
    console.log('Updating patient user...');
    const prisma = new PrismaClient();

    // Find the patient user
    const patientUser = await prisma.user.findFirst({
      where: {
        email: 'patient@example.com'
      }
    });

    if (!patientUser) {
      console.log('Patient user not found');
      return;
    }

    // Update the user role to patient and create a patient profile
    const updatedUser = await prisma.user.update({
      where: {
        id: patientUser.id
      },
      data: {
        role: 'patient',
        patientProfile: {
          create: {
            birthDate: new Date('1990-01-01'),
            address: '123 Main St, Anytown, USA',
            phone: '555-123-4567'
          }
        }
      },
      include: {
        patientProfile: true
      }
    });
    
    console.log('Patient user updated:', updatedUser);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating patient user:', error.message);
  }
}

updatePatientUser();
