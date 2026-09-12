const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'A&M Infinity Bites <noreply@aminfinitybites.health>';

module.exports = { resend, FROM_EMAIL };