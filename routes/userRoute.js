const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Updated path
const Student = require('../models/userModel'); // Updated path

// Define the routes
router.post('/create', userController.create);
router.post('/login', userController.Login);

router.get('/getAllUser', userController.getAllUser);
router.get('/:id', userController.getStudentById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteStudent);

module.exports = router;