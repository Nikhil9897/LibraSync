require('dotenv').config();
const nodemailer = require('nodemailer');

// Nodemailer Gmail Transport
// Uses service: 'gmail' with process.env.EMAIL_USER and process.env.EMAIL_PASS (Gmail App Password)

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            console.error('❌ EMAIL_USER or EMAIL_PASS environment variable is missing!');
            throw new Error('Email configuration error: missing credentials');
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 15000,
        });
    }
    return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
    const mailTransporter = getTransporter();

    // Auto-generate plain text version from HTML for spam filter compliance (multipart/alternative)
    const plainText = text || html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const fromAddress = process.env.EMAIL_USER
        ? `"LibraSync" <${process.env.EMAIL_USER}>`
        : '"LibraSync" <noreply@librasync.com>';

    const mailOptions = {
        from: fromAddress,
        to,
        replyTo: process.env.EMAIL_USER || to,
        subject,
        text: plainText,
        html,
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
        },
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return info;
};

module.exports = { sendEmail };
