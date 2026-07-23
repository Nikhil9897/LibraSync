require('dotenv').config();
const nodemailer = require('nodemailer');

const isGmail = !process.env.EMAIL_HOST || process.env.EMAIL_HOST.includes('gmail');

const transporterConfig = isGmail
    ? {
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
          tls: {
              rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 15000,
      }
    : {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: Number(process.env.EMAIL_PORT) === 465,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
          tls: {
              rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 15000,
      };

const transporter = nodemailer.createTransport(transporterConfig);

// Verify transporter config on startup so misconfigurations are caught early
transporter.verify((error) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        console.error('Please verify EMAIL_USER and EMAIL_PASS (App Password) in your server .env or hosting environment variables.');
    } else {
        console.log('✅ Email transporter is ready to send messages');
    }
});

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Cannot send email: EMAIL_USER or EMAIL_PASS environment variables are missing!');
        throw new Error('Email configuration error on server');
    }

    const mailOptions = {
        from: `"LibraSync" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return info;
};

module.exports = { sendEmail };
