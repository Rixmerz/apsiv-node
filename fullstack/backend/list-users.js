/**
 * List Users Script
 */
const { PrismaClient } = require('@prisma/client');

async function listUsers() {
  try {
    console.log('Listing all users in the database...');
    const prisma = new PrismaClient();

    const users = await prisma.user.findMany();
    
    console.log('Users in the database:');
    console.log(JSON.stringify(users, null, 2));
    
    console.log(`Total users: ${users.length}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error listing users:', error.message);
  }
}

listUsers();
