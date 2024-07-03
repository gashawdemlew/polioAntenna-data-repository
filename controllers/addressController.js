const User = require('../models/userModel');
const Region = require('../models/region');
const Zone = require('../models/zone');
const Woreda = require('../models/woreda');



require('dotenv').config();

module.exports = {
  createRegion: async (req, res) => {
    const { region_name } = req.body;
    try {

      const existingUser = await Region.findOne({ where: { region_name } });
      if (existingUser) {
        return res.status(409).json({ message: 'Region already exists' });
      }
        const newUser = await Region.create({region_name});
  
      res.json({ message: 'Region registered successfully',  });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createZone: async (req, res) => {
    const {region_id, zone_name } = req.body;
    try {

      const existingUser = await Zone.findOne({ where: { zone_name } });
      if (existingUser) {
        return res.status(409).json({ message: 'Zone already exists' });
      }
        const newUser = await Zone.create({region_id, zone_name});
  
      res.json({ message: 'Zone registered successfully',  });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  createWoreda: async (req, res) => {
    const {Zone_id, woreda_name } = req.body;
    try {

      const existingUser = await Woreda.findOne({ where: { zone_name } });
      if (existingUser) {
        return res.status(409).json({ message: 'Zone already exists' });
      }
        const newUser = await Woreda.create({Zone_id, woreda_name});
  
      res.json({ message: 'Woreda registered successfully',  });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  GetAllRegion: (req, res) => {
    Region.findAll()
      .then((students) => {
        res.json(students);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve students' });
      });
  },

  getZoneById: (req, res) => {
    const id = req.params.id;
    Student.findByPk(id)
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