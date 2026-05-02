/**
 * Seed Demo Users for ReqFlow
 * Run with: node scripts/seed-demo-users.cjs
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://Rayan:R%40y%40n123@cluster0.j1fsxxa.mongodb.net/reqflow?retryWrites=true&w=majority';

const demoUsers = [
  {
    name: 'Abdullah',
    email: 'abdullah@kfupm.edu.sa',
    password: 'abdullah123',
    role: 'client',
    title: 'Project Owner'
  },
  {
    name: 'Khalid',
    email: 'khalid@kfupm.edu.sa',
    password: 'khalid123',
    role: 'manager',
    title: 'Project Manager'
  },
  {
    name: 'Omar',
    email: 'omar@kfupm.edu.sa',
    password: 'omar123',
    role: 'member',
    title: 'Team Member'
  }
];

async function seedDemoUsers() {
  let client;

  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const db = client.db('reqflow');
    const usersCollection = db.collection('users');

    console.log('👥 Adding demo users...\n');

    for (const user of demoUsers) {
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: user.email });

      if (existingUser) {
        // Update password hash for existing user
        const passwordHash = await bcrypt.hash(user.password, 12);
        await usersCollection.updateOne(
          { email: user.email },
          {
            $set: {
              passwordHash,
              name: user.name,
              role: user.role,
              updatedAt: new Date()
            }
          }
        );
        console.log(`   ✏️  Updated: ${user.email} (${user.role})`);
      } else {
        // Create new user
        const passwordHash = await bcrypt.hash(user.password, 12);
        await usersCollection.insertOne({
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`   ✅ Created: ${user.email} (${user.role})`);
      }
    }

    console.log('\n✅ Demo users seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ Role     │ Email                  │ Password   │');
    console.log('   ├─────────────────────────────────────────────────┤');
    console.log('   │ Client   │ abdullah@kfupm.edu.sa  │ abdullah123│');
    console.log('   │ Manager  │ khalid@kfupm.edu.sa    │ khalid123  │');
    console.log('   │ Member   │ omar@kfupm.edu.sa      │ omar123    │');
    console.log('   └─────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed.');
    }
  }
}

seedDemoUsers().catch(console.error);
