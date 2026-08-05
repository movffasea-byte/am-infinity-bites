const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const { getPool } = require('./database');

const router = express.Router();

const RESET_CODE_EXPIRY_MINUTES = 10;

// ======================================================
// EMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ======================================================
// CREATE ADMIN JWT
// ======================================================

function createAdminToken(admin) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: 'admin'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

// ======================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ======================================================

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Administrator authentication required'
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Administrator access required'
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `
      SELECT id, name, email
      FROM admins
      WHERE id = $1
      `,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Administrator account no longer exists'
      });
    }

    req.admin = result.rows[0];

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired administrator session'
    });
  }
}

// ======================================================
// ADMIN LOGIN
// POST /admin/login
// ======================================================

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();

  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT id, name, email, password
      FROM admins
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const admin = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = createAdminToken(admin);

    return res.json({
      message: 'Login successful',

      token,

      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);

    return res.status(500).json({
      message: 'Unable to login'
    });
  }
});

// ======================================================
// CHECK CURRENT ADMIN SESSION
// GET /admin/me
// ======================================================

router.get('/me', requireAdmin, (req, res) => {
  return res.json({
    admin: req.admin
  });
});

// ======================================================
// FORGOT PASSWORD
// POST /admin/forgot-password
// ======================================================

router.post('/forgot-password', async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();

  if (!email) {
    return res.status(400).json({
      message: 'Email is required'
    });
  }

  // Same response whether the account exists or not.
  // This prevents people from discovering admin emails.
  const genericResponse = {
    message:
      'If that email belongs to an administrator, a reset code has been sent.'
  };

  try {
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT id, name, email
      FROM admins
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.json(genericResponse);
    }

    const admin = result.rows[0];

    // Generate a secure six-digit code.
    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Store only a hash of the code.
    const codeHash = await bcrypt.hash(
      resetCode,
      10
    );

    const expiresAt = new Date(
      Date.now() +
      RESET_CODE_EXPIRY_MINUTES * 60 * 1000
    );

    // Disable any previous unused codes.
    await pool.query(
      `
      UPDATE admin_password_resets
      SET used = TRUE
      WHERE admin_id = $1
      AND used = FALSE
      `,
      [admin.id]
    );

    await pool.query(
      `
      INSERT INTO admin_password_resets
      (
        admin_id,
        code_hash,
        expires_at,
        used
      )
      VALUES ($1, $2, $3, FALSE)
      `,
      [
        admin.id,
        codeHash,
        expiresAt
      ]
    );

    try {
      await transporter.sendMail({
        from:
          `"A&M Infinity Bites" <${process.env.EMAIL_USER}>`,

        to: admin.email,

        subject:
          'A&M Infinity Bites Admin Password Reset',

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 520px;
            margin: 0 auto;
            padding: 32px;
          ">

            <h2>Admin Password Reset</h2>

            <p>Hello ${admin.name},</p>

            <p>
              A password reset was requested for your
              A&M Infinity Bites administrator account.
            </p>

            <p>Your verification code is:</p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 24px 0;
            ">
              ${resetCode}
            </div>

            <p>
              This code expires in
              ${RESET_CODE_EXPIRY_MINUTES} minutes.
            </p>

            <p>
              If you didn't request this reset,
              you can ignore this email.
            </p>

          </div>
        `
      });

    } catch (emailError) {
      console.error(
        'Admin reset email error:',
        emailError
      );

      // Make the undelivered code unusable.
      await pool.query(
        `
        UPDATE admin_password_resets
        SET used = TRUE
        WHERE admin_id = $1
        AND used = FALSE
        `,
        [admin.id]
      );

      return res.status(500).json({
        message:
          'Unable to send password reset email. Please try again later.'
      });
    }

    return res.json(genericResponse);

  } catch (error) {
    console.error(
      'Admin forgot password error:',
      error
    );

    return res.status(500).json({
      message:
        'Unable to process password reset request'
    });
  }
});

// ======================================================
// VERIFY RESET CODE
// POST /admin/verify-reset-code
// ======================================================

router.post('/verify-reset-code', async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();

  const code = String(req.body.code || '')
    .trim();

  if (!email || !code) {
    return res.status(400).json({
      message:
        'Email and verification code are required'
    });
  }

  try {
    const pool = getPool();

    const adminResult = await pool.query(
      `
      SELECT id
      FROM admins
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (adminResult.rows.length === 0) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    const admin = adminResult.rows[0];

    const resetResult = await pool.query(
      `
      SELECT id, code_hash
      FROM admin_password_resets
      WHERE admin_id = $1
      AND used = FALSE
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [admin.id]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    const reset = resetResult.rows[0];

    const codeMatches = await bcrypt.compare(
      code,
      reset.code_hash
    );

    if (!codeMatches) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    return res.json({
      message: 'Verification code confirmed'
    });

  } catch (error) {
    console.error(
      'Admin reset verification error:',
      error
    );

    return res.status(500).json({
      message: 'Unable to verify code'
    });
  }
});

// ======================================================
// RESET ADMIN PASSWORD
// POST /admin/reset-password
// ======================================================

router.post('/reset-password', async (req, res) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();

  const code = String(req.body.code || '')
    .trim();

  const newPassword = String(
    req.body.newPassword || ''
  );

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      message:
        'Email, verification code and new password are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message:
        'Password must contain at least 8 characters'
    });
  }

  try {
    const pool = getPool();

    const adminResult = await pool.query(
      `
      SELECT id
      FROM admins
      WHERE LOWER(email) = $1
      `,
      [email]
    );

    if (adminResult.rows.length === 0) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    const admin = adminResult.rows[0];

    const resetResult = await pool.query(
      `
      SELECT id, code_hash
      FROM admin_password_resets
      WHERE admin_id = $1
      AND used = FALSE
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [admin.id]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    const reset = resetResult.rows[0];

    const codeMatches = await bcrypt.compare(
      code,
      reset.code_hash
    );

    if (!codeMatches) {
      return res.status(400).json({
        message:
          'Invalid or expired verification code'
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `
        UPDATE admins
        SET password = $1
        WHERE id = $2
        `,
        [
          hashedPassword,
          admin.id
        ]
      );

      // Consume all outstanding reset codes.
      await client.query(
        `
        UPDATE admin_password_resets
        SET used = TRUE
        WHERE admin_id = $1
        `,
        [admin.id]
      );

      await client.query('COMMIT');

    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;

    } finally {
      client.release();
    }

    return res.json({
      message:
        'Password changed successfully. You can now login.'
    });

  } catch (error) {
    console.error(
      'Admin password reset error:',
      error
    );

    return res.status(500).json({
      message: 'Unable to reset password'
    });
  }
});

module.exports = {
  router,
  requireAdmin
};