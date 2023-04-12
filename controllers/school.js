//const Post = require('../models/post');
const School = require('../models/school');
const resourceNotFound = require('../util/resourceNotFound');

exports.getLocation = async (req, res, next) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.json(school.location);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

exports.addLocation = async (req, res, next) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        school.location = req.body;
        await school.save();
        res.json(school);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

exports.getAllSchools = async (req,res,next) => {    
    try {
        const schools = await School.find().select('-password -__v');
        res.status(200).json({schools: schools});
    } catch (err) {
        next(err);
    }
    
}


exports.getSchool = async (req,res,next) => {    // params(id)
    try {
        const school = await School.findOne({_id: req.params.id}).select('-password -__v');
        if (!school) resourceNotFound(`No School Found With ID = ${req.params.id}`);
        res.status(200).json({school: school});
    } catch (err) {
        next(err);
    }
    
}



//  Get School Posts
/*exports.getSchoolPosts = async (req,res,next) => {    // params(id)
    try {
        const posts = await Post.find({school: req.params.id}).populate('school comments.school', '-password')
        .select('-updatedAt -__v').sort({createdAt: -1});
        res.status(200).json({posts: posts});
    } catch (err) {
        next(err);
    }
    
}*/

//   change school image 
exports.changeSchoolImage = async (req,res,next) => {       // image - file
    if (!req.file) {
        const error = new Error("No Image Provided");
        error.statusCode = 422;
        return next(error);
    }

    try {
        const imageUrl = `${req.protocol}://${req.get("host")}/images/`;
        const school = await School.findById(req.schoolId);
        school.imageUrl = imageUrl + req.file.filename;
        let updatedSchool = await school.save();
        res.status(200).json({
            message: "Image Changed Successfully", 
            school: {
                _id: updatedSchool._id,
                email: updatedSchool.email,
                name: updatedSchool.name,
                imageUrl: updatedSchool.imageUrl
            }
        });
    } catch (err) {
        next(err);
    }


}







