const nodemailer = require('nodemailer');

// 
exports.sendVerificationEmail = async (user) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email/${user.emailVerificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `<p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
};

exports.sendResetPasswordEmail = async (user) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const resetLink = `${process.env.BASE_URL}/api/auth/reset-password/${user.resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset',
        html: `<p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
               <p>Please click the following link or paste it into your browser to complete the process:</p>
               <p><a href="${resetLink}">${resetLink}</a></p>
               <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
}