const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT = process.env.JWT_SECRET

module.exports = {
  create: async (req, res) => {
    const { first_name, last_name,phoneNo,zone,woreda,lat,long,user_role,password } = req.body;
console.log(JWT);
console.log(req.body);
    try {

      const employeeCount = await User.count();
      const employeeId = `E-${(employeeCount + 1).toString().padStart(3, '0')}`;
      // Check if the username already exists
      const existingUser = await User.findOne({ where: { phoneNo } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
  
      // Create a new user
      const newUser = await User.create({ first_name, last_name,phoneNo,zone,woreda,lat,long,user_role,password });
  
      // Generate JWT
      const token = jwt.sign({ userId: newUser.user_id }, JWT);
  
      res.json({ message: 'User registered successfully', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  Login: async (req, res) => {
    const { phoneNo, password } = req.body;

    try {
      // Authenticate user credentials
      const user = await User.findOne({ where: { phoneNo, password } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      else{
  
      // Generate JWT
      const token = jwt.sign({ userId: user.user_id }, JWT);
      res.status(200).json({ message:"Successfully Login",token: token,
        user_role:user.user_role







      });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllUser: (req, res) => {
    User.findAll()
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve user' });
      });
  },

  getStudentById: (req, res) => {
    const id = req.params.id;
    User.findByPk(id)
      .then((student) => {
        if (student) {
          res.json(student);
        } else {
          res.status(404).json({ error: 'Student not found' });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve student' });
      });
  },

  updateStudent: (req, res) => {
    const id = req.params.id;
    const { name, age, email, mark } = req.body;
    User.update({ name, age, email, mark }, { where: { id } })
      .then(() => {
        res.json({ message: 'Student updated successfully' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to update student' });
      });
  },

  deleteStudent: (req, res) => {
    const id = req.params.id;
    User.destroy({ where: { id } })
      .then(() => {
        res.json({ message: 'Student deleted successfully' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to delete student' });
      });
  },
};