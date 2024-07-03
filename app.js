const express = require('express');
const clinicRoute = require('./routes/clinicalRoute');
const  userRoute = require('./routes/userRoute');
const { Region, Zone, Wereda } = require('./models');
const clinicalModel = require('./models/clinicalHistoryModel');


const sequelize = require('./config/database'); // Assuming the sequelize configuration is in a separate file
require('dotenv').config();

const app = express();
const db = require('./models');


// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}




async function getLastEpidNumber() {
  try {
    const lastEpidNumber = await clinicalModel.max('epid_number');
    return lastEpidNumber;
  } catch (error) {
    console.error('Error fetching last epid_number:', error);
    throw error;
  }
}

app.get('/last-epid-number', async (req, res) => {
  try {
    const lastEpidNumber = await getLastEpidNumber();
    res.json({ lastEpidNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch last epid_number' });
  }
});



app.get('/regions', async (req, res) => {
  try {
    const regions = await Region.findAll();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// Get zones by regionId
app.get('/zones/:regionId', async (req, res) => {
  const { regionId } = req.params;
  try {
    const zones = await Zone.findAll({ where: { region_id: regionId } });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// Get weredas by zoneId
app.get('/weredas/:zoneId', async (req, res) => {
  const { zoneId } = req.params;
  try {
    const weredas = await Wereda.findAll({ where: { zone_id: zoneId } });
    res.json(weredas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weredas' });
  }
});

checkDatabaseConnection();
// Routes
app.use('/user', userRoute);
app.use('/clinic', clinicRoute);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});