/**
 * Check Relations Script
 * 
 * This script checks the relationships between users, doctors, and patients
 */
const { PrismaClient } = require('@prisma/client');

async function checkRelations() {
  try {
    console.log('Checking user-doctor-patient relationships...');
    const prisma = new PrismaClient();

    // Get all users with their doctor and patient profiles
    const users = await prisma.user.findMany({
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });
    
    console.log('User relationships:');
    users.forEach(user => {
      console.log(`\nUser ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has doctor profile: ${user.doctorProfile !== null}`);
      if (user.doctorProfile) {
        console.log(`  Doctor ID: ${user.doctorProfile.id}`);
        console.log(`  Specialty: ${user.doctorProfile.specialty}`);
      }
      console.log(`Has patient profile: ${user.patientProfile !== null}`);
      if (user.patientProfile) {
        console.log(`  Patient ID: ${user.patientProfile.id}`);
        console.log(`  Phone: ${user.patientProfile.phone}`);
      }
    });
    
    // Check for any inconsistencies
    const inconsistentUsers = users.filter(user => {
      if (user.role === 'doctor' && !user.doctorProfile) {
        return true; // Doctor without doctor profile
      }
      if (user.role === 'patient' && !user.patientProfile) {
        return true; // Patient without patient profile
      }
      if (user.role === 'doctor' && user.patientProfile) {
        return true; // Doctor with patient profile
      }
      if (user.role === 'patient' && user.doctorProfile) {
        return true; // Patient with doctor profile
      }
      return false;
    });
    
    if (inconsistentUsers.length > 0) {
      console.log('\n⚠️ Found inconsistencies:');
      inconsistentUsers.forEach(user => {
        console.log(`- User ${user.id} (${user.email}, role: ${user.role}):`);
        if (user.role === 'doctor' && !user.doctorProfile) {
          console.log('  Doctor without doctor profile');
        }
        if (user.role === 'patient' && !user.patientProfile) {
          console.log('  Patient without patient profile');
        }
        if (user.role === 'doctor' && user.patientProfile) {
          console.log('  Doctor with patient profile');
        }
        if (user.role === 'patient' && user.doctorProfile) {
          console.log('  Patient with doctor profile');
        }
      });
    } else {
      console.log('\n✅ No inconsistencies found.');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking relationships:', error.message);
  }
}

checkRelations();
