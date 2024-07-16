const express = require('express');
const router = express.Router();
const userController = require('../controllers/clinical_info'); // Updated path

// Define the routes
router.post('/post', userController.create);
router.get('/getMessage676', userController.getMessages);

// router.post('/login', userController.Login);

// router.get('/', userController.getAllStudents);
// router.get('/:id', userController.getStudentById);
// router.put('/:id', userController.updateStudent);
// router.delete('/:id', userController.deleteStudent);

module.exports = router;