require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

const isGmail = !process.env.EMAIL_HOST || process.env.EMAIL_HOST.includes('gmail');

// Custom IPv4 lookup override to prevent ENETUNREACH (IPv6 network unreachable) errors on cloud platforms
const forceIPv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
};

const transporterConfig = isGmail
    ? {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // Direct SSL connection
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
          tls: {
              rejectUnauthorized: false,
          },
          lookup: forceIPv4Lookup,
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
          lookup: forceIPv4Lookup,
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

const sendEmail = async ({ to, subject, html, text }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Cannot send email: EMAIL_USER or EMAIL_PASS environment variables are missing!');
        throw new Error('Email configuration error on server');
    }

    // Auto-generate plain text version from HTML to pass email spam filters (multipart/alternative)
    const plainText = text || html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                 .replace(/<[^>]+>/g, ' ')
                                 .replace(/\s+/g, ' ')
                                 .trim();

    const mailOptions = {
        from: `"LibraSync" <${process.env.EMAIL_USER}>`,
        to,
        replyTo: process.env.EMAIL_USER,
        subject,
        text: plainText,
        html,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
        },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return info;
};

module.exports = { sendEmail };
