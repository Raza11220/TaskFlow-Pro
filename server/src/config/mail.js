import nodemailer from 'nodemailer';
import env from './env.js';
import logger from './logger.js';

export const isMailConfigured = Boolean(
  env.SMTP_HOST &&
  env.SMTP_USER &&
  env.SMTP_PASS
);

let transporter = null;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('SMTP mail transporter configured.');
} else {
  logger.warn('SMTP credentials not configured. Email delivery is disabled.');
}

export const sendMail = async ({ to, subject, html, text }) => {
  if (!isMailConfigured || !transporter) {
    throw new Error('SMTP credentials are missing. Configure SMTP to enable email delivery.');
  }

  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

export default { transporter, isMailConfigured, sendMail };
