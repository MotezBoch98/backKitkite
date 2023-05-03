const express = require('express');
const messageController = require('../controllers/message');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.post('/', isAuth, messageController.postMessage);
router.get('/:userId/:otherUserId', isAuth, messageController.getMessages);

module.exports = router;