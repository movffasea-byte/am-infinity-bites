require('dotenv').config();

const bcrypt = require('bcryptjs');
const { getPool } = require('./database');

async function createAdmin() {
  const name = String(process.env.ADMIN_NAME || '').trim();

  const email = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();

  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!name || !email || !password) {
    console.error(
      'ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.'
    );

    process.exit(1);
  }

  if (password.length < 8) {
    console.error(
      'ADMIN_PASSWORD must contain at least 8 characters.'
    );

    process.exit(1);
  }

  const pool = getPool();

  try {
    const existingAdmin = await pool.query(
      `
      SELECT id
      FROM admins
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log(
        'An administrator with this email already exists.'
      );

      return;
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const result = await pool.query(
      `
      INSERT INTO admins
      (
        name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, email
      `,
      [
        name,
        email,
        passwordHash
      ]
    );

    console.log('Administrator created successfully:');
    console.log(result.rows[0]);

  } catch (error) {
    console.error(
      'Failed to create administrator:',
      error
    );

    process.exitCode = 1;

  } finally {
    await pool.end();
  }
}

createAdmin();