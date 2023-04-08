const express = require('express');
const authController = require('../controllers/auth');
const { body } = require('express-validator/check');
const User = require('../models/user');
const bcrypt = require("bcryptjs")

const router = express.Router();


router.post('/signup', [
    body('firstname').isLength({min:2})
        .withMessage("Firstname should be at least 2 characters."),
    body('lastname').isLength({min:2})
        .withMessage("Lastname should be at least 2 characters."),
    body('email').isEmail()
        .withMessage("E-mail must be valid.")
        .custom( (value, {req}) => {
            return User.findOne({email: value})
            .then( user => {
                if (user) {
                    return Promise.reject("E-mail Already Exist.");
                }
            });
    }),
    body('password').trim()
        .isLength({min:6}).withMessage("Password must be at least 6 length"),
    
    body('confirmPassword').trim()
        .custom( (value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            }
            return true;
        })

] ,authController.signup);

router.post('/login', [
    body('email').isEmail()
        .withMessage("E-mail Not Valid!")
        .custom( (value, {req}) => {
            return User.findOne({email: value})
            .then( user => {
                if (!user) {
                    return Promise.reject("E-mail or Password not correct!");
                }
            })
        }),
    body('password').trim()
        .custom( async (value, {req}) => {
            const user = await User.findOne({email: req.body.email});
            // in social login and have no password 
            if (!user.password) {
                throw new Error("Login with your social provider");
            } else {
                const isEqual = await bcrypt.compare(value, user.password);
                if (!isEqual) {
                    throw new Error("E-mail or Password not correct!");
                }
            }
            
            return true;
        })
] , authController.login);

router.get('/verify-email/:token', async (req, res, next) => {
    try {
      const user = await User.findOne({ emailVerificationToken: req.params.token });
      if (!user) {
        return res.status(404).json({ message: 'Invalid verification link.' });
      }
      user.emailVerificationToken = undefined;
      user.isVerified = true;
      await user.save();
      res.status(200).json({ message: 'Your email address has been verified.' });
    } catch (error) {
      next(error);
    }
});

router.get('/forgot-password')

router.get('/checkemail/:email', authController.checkEmail);

router.post('/social-login',[
    body('email').isEmail()
    .withMessage("E-mail must be valid.")],
    authController.socialLogin);
module.exports = router;