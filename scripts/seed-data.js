// scripts/seed-data.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'resumesmart',
  user: 'postgres',
  password: 'password',
});

async function seedData() {
  try {
    console.log('Seeding test data...');

    // Create test user
    await pool.query(`
      INSERT INTO users (email, name) 
      VALUES ('test@resumesmart.ai', 'Test User')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('Test data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();