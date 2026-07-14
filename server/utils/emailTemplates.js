exports.getWelcomeEmailTemplate = (name) => {
    return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 0; color: #1a1f36;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: #0d5959; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 32px; font-weight: bold; margin: 0; font-style: italic;">
                    <span style="color: #d4a853;">Libra</span>Sync
                </h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px;">
                <h2 style="font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 700; color: #1a1f36;">Welcome to the Library, ${name}! 📚</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                    We're absolutely thrilled to have you join our community of readers. Your account has been successfully created, and your reading journey begins today.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                    With your new account, you can:
                </p>
                
                <ul style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 35px; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Explore thousands of titles in our premium catalog</li>
                    <li style="margin-bottom: 10px;">Borrow and reserve books instantly</li>
                    <li style="margin-bottom: 10px;">Track your reading trends and history</li>
                    <li style="margin-bottom: 10px;">Chat with Libra AI, your personalized library assistant</li>
                </ul>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background-color: #0d5959; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(13, 89, 89, 0.2);">
                        Start Exploring
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; font-size: 14px; color: #64748b;">
                <p style="margin: 0;">You're receiving this email because you recently created an account.</p>
                <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} LibraSync. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;
};

exports.getResetPasswordEmailTemplate = (resetUrl, userName = 'User') => {
    return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 0; color: #1a1f36;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: #0d5959; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; font-family: 'Georgia', serif; font-size: 32px; font-weight: bold; margin: 0; font-style: italic;">
                    <span style="color: #d4a853;">Libra</span>Sync
                </h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px;">
                <h2 style="font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: 700; color: #1a1f36;">Password Reset Request</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                    Hi ${userName},
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                    We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                    To securely reset your password, please click the button below. This link is only valid for the next 10 minutes.
                </p>
                
                <div style="text-align: center; margin-bottom: 35px;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #0d5959; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(13, 89, 89, 0.2);">
                        Reset Password
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
                    Having trouble clicking the button? Copy and paste the following link into your browser:<br/>
                    <a href="${resetUrl}" style="color: #0d5959; word-break: break-all;">${resetUrl}</a>
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 24px 30px; text-align: center; font-size: 14px; color: #64748b;">
                <p style="margin: 0;">You're receiving this email because a password reset was requested for your account.</p>
                <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} LibraSync. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;
};
