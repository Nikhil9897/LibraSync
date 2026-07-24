require('dotenv').config();

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzWiq0TMh9zEO48eDlv3m_4FOYKudcN2QwAqBJdUv7wdXvngbaaL3kCLwojC5Xarr9ZbA/exec';

/**
 * Sends transactional email using Google Apps Script Web App HTTPS relay (Port 443).
 * Operates over HTTPS — 100% bypasses Render free-tier SMTP blocks and sends to ANY recipient email.
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                to,
                subject,
                html,
            }),
        });

        const data = await response.json();
        console.log(`✉️ Email dispatched successfully to ${to} via Google Apps Script (Status: ${data.status})`);
        return data;
    } catch (err) {
        console.error(`❌ Google Apps Script Email Relay Error for ${to}:`, err.message);
        throw err;
    }
};

module.exports = { sendEmail };
