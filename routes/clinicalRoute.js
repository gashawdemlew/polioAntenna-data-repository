const express = require('express');
const router = express.Router();
const userController = require('../controllers/clinical_info'); // Updated path

// Define the routes
router.post('/post', userController.register,);
router.post('/create', userController.uploadFiles, userController.create);


router.get('/getMessage676', userController.getMessages);
router.put('/messages23/:push_id', userController.updateMessageStatus);


module.exports = router;