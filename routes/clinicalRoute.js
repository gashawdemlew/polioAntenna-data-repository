const express = require('express');
const router = express.Router();
const userController = require('../controllers/clinical_info'); // Updated path

// Define the routes
router.post('/create', userController.create);
// router.post('/login', userController.Login);

// router.get('/', userController.getAllStudents);
// router.get('/:id', userController.getStudentById);
// router.put('/:id', userController.updateStudent);
// router.delete('/:id', userController.deleteStudent);

module.exports = router;