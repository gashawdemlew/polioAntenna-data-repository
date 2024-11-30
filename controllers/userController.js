const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT = process.env.JWT_SECRET

module.exports = {
  create: async (req, res) => {
    const { first_name, last_name,gender,phoneNo,emergency_phonno,region,zone,woreda,lat,long,user_role,password } = req.body;
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
      const newUser = await User.create({ first_name,gender, last_name,phoneNo,region,emergency_phonno,zone,woreda,lat,long,user_role,password });
  
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
      res.status(200).json({ message:"Successfully Login",
        token: token,
    

        user_id:user.user_id,
        first_name:user.first_name,
        last_name:user.last_name,
        password:user.password,


        user_role:user.user_role,
        phoneNo:user.phoneNo,
        zone:user.zone,
        // woreda:user.woreda,
        woreda:user.woreda,

        region:user.region,
        emergency_phonno:user.emergency_phonno,
   

      

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

  getUserByPhoNno: (req, res) => {
    const { phoneNo } = req.body; // Extract phone number from request body

    console.log(phoneNo)
  
    // Validate that phone number is provided
    if (!phoneNo) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
  
    // Find the user by phone number
    User.findOne({ where: { phoneNo } }) // Assuming phoneNo is a unique field
      .then((student) => {
        if (student) {
          // Return the password (consider security implications)
          res.json({ password: student.password });
        } else {
          res.status(404).json({ error: 'Student not found' });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve student' });
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

// Assuming you're using Sequelize for ORM
 updateUser :(req, res) => {
  const id = req.params.id;
  const { first_name, last_name, phoneNo, zone, woreda, region, password } = req.body;

  // Ensure the user exists before trying to update
  User.findByPk(id)
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user details
      return user.update({
        first_name,
        last_name,
        phoneNo,
        zone,
        woreda,
        region,
        password // Consider hashing the password before storing it
      });
    })
    .then(() => {
      res.json({ message: 'User updated successfully' });
    })
    .catch((error) => {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to update user' });
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