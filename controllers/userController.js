const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT = process.env.JWT_SECRET
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

module.exports = {


  create: async (req, res) => {
    const { first_name, last_name, gender, phoneNo, emergency_phonno, region, zone, woreda, lat, long, user_role, password } = req.body;
    console.log(JWT);
    console.log(req.body);

    try {
      const employeeCount = await User.count();
      const employeeId = `E-${(employeeCount + 1).toString().padStart(3, '0')}`;

      // Check if the phone number already exists
      const existingUser = await User.findOne({ where: { phoneNo } });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password
      const newUser = await User.create({ first_name, gender, last_name, phoneNo, region, emergency_phonno, zone, woreda, lat, long, user_role, password: hashedPassword });

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
      // Find the user by phone number
      const user = await User.findOne({ where: { phoneNo } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      let isPasswordValid;

      if (user.password.startsWith('$2')) {
        // Password is hashed with bcrypt
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Plain text password
        isPasswordValid = password === user.password;
      }

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Migrate to hashed password if it was plaintext
      if (!user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save(); // Save the hashed password for future logins
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.user_id }, JWT);
      res.status(200).json({
        message: "Successfully logged in",
        token: token,
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_role: user.user_role,
        phoneNo: user.phoneNo,
        zone: user.zone,
        woreda: user.woreda,
        region: user.region,
        emergency_phonno: user.emergency_phonno,
        status: user.status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAllUser: (req, res) => {
    User.findAll({
      order: [['createdAt', 'DESC']], // Order by createdAt in descending order
    })
      .then((users) => {
        res.json(users);
      })
      .catch((error) => {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Failed to retrieve users' });
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
  updateUser: async (req, res) => {
    const id = req.params.id;
    const { first_name, last_name, phoneNo, zone, woreda, region, password, status } = req.body;

    try {
      // Fetch the user by ID
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user details only with the fields provided in req.body
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phoneNo: phoneNo || user.phoneNo,
        zone: zone || user.zone,
        woreda: woreda || user.woreda,
        region: region || user.region,
        status: status || user.status,
        password: password || user.password // Ensure password is hashed
      });

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to update user' });
    }
  },



  resetPassword: async (req, res) => {
    try {
      const { phoneNo, resetToken, newPassword } = req.body;

      // Check if user exists and token is valid
      const user = await User.findOne({
        where: {
          phoneNo,
          resetPasswordToken: resetToken,
          resetPasswordExpires: { [Op.gt]: new Date() } // Token must not be expired
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password and clear token
      await user.update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { phoneNo } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { phoneNo } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a reset token (6-digit OTP)
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

      // Update user with reset token
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      });

      // TODO: Send `resetToken` via SMS or email

      res.status(200).json({ message: 'Reset code sent!', resetToken }); // REMOVE token in production

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  updateUserPhoNo: async (req, res) => {
    const { phoneNo, first_name, last_name, zone, woreda, region, password, status } = req.body;

    try {
      // Ensure phoneNo is provided
      if (!phoneNo) {
        return res.status(400).json({ error: 'phoneNo is required to update the user' });
      }

      // Fetch the user by phoneNo
      const user = await User.findOne({ where: { phoneNo } });
      if (!user) {
        return res.status(404).json({ error: 'User not found with the provided phoneNo' });
      }

      // Update user details only with the fields provided in req.body
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phoneNo: phoneNo || user.phoneNo, // Optional, but you may omit updating phoneNo itself
        zone: zone || user.zone,
        woreda: woreda || user.woreda,
        region: region || user.region,
        status: status || user.status,
        password: password || user.password // Ensure password is hashed
      });

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Failed to update user' });
    }
  },


  deleteStudent: (req, res) => {
    const user_id = req.params.user_id;
    User.destroy({ where: { user_id } })
      .then(() => {
        res.json({ message: 'user deleted successfully' });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to delete user' });
      });
  },
};