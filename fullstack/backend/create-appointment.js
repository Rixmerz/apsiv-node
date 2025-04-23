/**
 * Create Appointment Script
 */
const { PrismaClient } = require('@prisma/client');

async function createAppointment() {
  try {
    console.log('Creating appointment...');
    const prisma = new PrismaClient();

    // Find the doctor and patient
    const doctor = await prisma.doctor.findFirst();
    const patient = await prisma.patient.findFirst();

    if (!doctor || !patient) {
      console.log('Doctor or patient not found');
      return;
    }

    // Create an appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: 'scheduled',
        notes: 'Regular checkup',
        doctorId: doctor.id,
        patientId: patient.id
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        },
        patient: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log('Appointment created:', appointment);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating appointment:', error.message);
  }
}

createAppointment();
