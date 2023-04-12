const express = require('express');
const schoolController = require('../controllers/school');
const validObjectId = require('../middleware/validObjectId');
const isAuth = require('../middleware/isAuth');
const multer = require('../middleware/upload-image');
const router = express.Router();

// get all schools
router.get('/', isAuth, schoolController.getAllSchools);

//  Get school by id
router.get('/:id', [isAuth, validObjectId], schoolController.getSchool);

// get school location
router.get('/:id/location', [isAuth, validObjectId], schoolController.getLocation)

// add school location
router.post('/:id/location', [isAuth, validObjectId], schoolController.addLocation)

//  Get school posts
// router.get('/:id/posts' , [isAuth,validObjectId] ,schoolController.getSchoolPosts);

//  change school image
router.post('/image',
    [isAuth, multer.single('image')],
    schoolController.changeSchoolImage);

module.exports = router;