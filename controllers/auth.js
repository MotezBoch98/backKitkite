const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const crypto = require('crypto');
const emailSender = require('../util/emailVerification');
const School = require('../models/school');

// signup users
exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .json({ message: "Validation Errors!", data: errors.array() });
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const emailVerificationToken = crypto.randomBytes(20).toString('hex');
        const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hashedPassword,
            isVerified: false,
            emailVerificationToken: emailVerificationToken
        });

        const newUser = await user.save();
        await emailSender.sendVerificationEmail(newUser);
        const token = newUser.generateAuthToken();
        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: newUser,
            token: token
        });

    } catch (err) {
        next(err);
    }
}


exports.signupSchool = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .json({ message: "Validation Errors!", data: errors.array() });
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const emailVerificationToken = crypto.randomBytes(20).toString('hex');
        const school = new School({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            isVerified: false,
            emailVerificationToken: emailVerificationToken
        });

        const newSchool = await school.save();
        await emailSender.sendVerificationEmail(newSchool);
        const token = newSchool.generateAuthToken();
        res.status(201).json({
            message: 'School created successfully. Please check your email to verify your account.',
            school: newSchool,
            token: token
        });

    } catch (err) {
        next(err);
    }
}


//  login users
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: "Validation Errors!", data: errors.array() });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            const school = await School.findOne({ email: req.body.email });
            if (!school) {
                return res.status(404).json({ message: "E-mail or Password not correct!" });
            } else if (!school.isVerified) {
                return res.status(403).json({ message: "Not Verified School Yet!" });
            }
            user = school;
        } else if (!user.isVerified) {
            return res.status(403).json({ message: "Not Verified User Yet!" });
        }

        const token = user.generateAuthToken(); // Generate JWT
        res.status(200).json({ token: token, user: user });
    } catch (err) {
        next(err);
    }
};


//  login users
exports.socialLogin = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422)
            .json({ message: "Validation Errors!", data: errors.array() });
    }
    try {
        const user = await User.findOne({ email: req.body.email });

        // check of email found
        if (user) {
            const token = user.generateAuthToken();  // Generate JWT
            return res.status(200).json({ token: token, user: user });
        } else {
            const user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email
            });
            let newUser = await user.save();
            const token = newUser.generateAuthToken();  // Generate JWT
            return res.status(201).json({ token: token, user: newUser });
        }

    } catch (err) {
        next(err)
    };
}

exports.verifyEmail = async (req, res, next) => {
    try {
        let user = await User.findOne({ emailVerificationToken: req.params.token });
        let isSchool = false;
        if (!user) {
            user = await School.findOne({ emailVerificationToken: req.params.token });
            isSchool = true;
            if (!user) {
                return res.status(404).json({ message: 'Invalid verification link.' });
            }
        }

        user.emailVerificationToken = undefined;
        user.isVerified = true;
        await user.save();
        let message = 'Your email address has been verified.';
        if (isSchool) {
            message = 'Your school email address has been verified.';
        }
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
}


exports.forgotPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation Errors!', data: errors.array() });
    }

    try {
        const email = req.body.email;
        const user = await User.findOne({ email });
        if (!user) {
            const school = await School.findOne({ email });
            if (!school) {
                return res.status(404).json({ message: 'User with this email address does not exist!' });
            }
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        await emailSender.sendResetPasswordEmail(user);

        res.status(200).json({ message: 'A reset password link has been sent to your email address!' });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: 'Validation Errors!', data: errors.array() });
    }

    const password = req.body.password;
    const token = req.params.token;

    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token!' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Your password has been successfully updated!' });
    } catch (error) {
        next(error);
    }
};


exports.checkEmail = async (req, res, next) => {
    let user = await User.findOne({ email: req.params.email });
    let emailExist = false;
    if (user) {
        emailExist = true;
    }
    res.status(200).json({ emailExist: emailExist });
}
