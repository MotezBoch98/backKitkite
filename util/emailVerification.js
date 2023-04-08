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
