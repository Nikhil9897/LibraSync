require('dotenv').config();
const { Resend } = require('resend');

// Resend uses HTTPS (port 443) — works on all cloud hosts including Render free tier
// which blocks outbound SMTP ports (25, 465, 587)

let resendClient = null;

const getClient = () => {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY environment variable is missing!');
        }
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
};

// Log startup configuration status
if (!process.env.RESEND_API_KEY) {
    console.error('❌ Email service: RESEND_API_KEY environment variable is missing. Set it in Render dashboard.');
} else {
    console.log('✅ Email transporter is ready to send messages (via Resend HTTPS API)');
}

const sendEmail = async ({ to, subject, html, text }) => {
    const client = getClient();

    // Auto-generate plain text version from HTML to pass spam filters (multipart/alternative)
    const plainText = text || html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // EMAIL_FROM should be a verified Resend sender, e.g. "LibraSync <noreply@yourdomain.com>"
    // Default to Resend's shared test sender for initial testing
    const fromAddress = process.env.EMAIL_FROM || 'LibraSync <onboarding@resend.dev>';

    const { data, error } = await client.emails.send({
        from: fromAddress,
        to,
        subject,
        html,
        text: plainText,
    });

    if (error) {
        console.error(`❌ Resend API error sending to ${to}:`, error);
        throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log(`✉️ Email sent successfully to ${to} (Resend ID: ${data.id})`);
    return data;
};

module.exports = { sendEmail };
