const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://Rayan:R%40y%40n123@cluster0.j1fsxxa.mongodb.net/reqflow?retryWrites=true&w=majority';

async function checkUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB\n');

    const db = client.db('reqflow');
    const users = await db.collection('users').find({}).toArray();

    console.log(`Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
      console.log(`  passwordHash: ${user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'MISSING'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUsers();
