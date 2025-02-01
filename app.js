const express = require('express');
const cors = require('cors');
const path = require('path');

const clinicRoute = require('./routes/clinicalRoute');
const userRoute = require('./routes/userRoute');
const ModelRoute = require('./routes/modelRoute');

const clinicalModel = require('./models/clinicalHistoryModel');


const sequelize = require('./config/database'); // Assuming the sequelize configuration is in a separate file
require('dotenv').config();

const app = express();
const db = require('./models');


// Middleware
app.use(express.json());

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


async function checkDatabaseConnection() {
  try {
    await sequelize.sync({ alter: true });

    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}



async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Models synchronized with the database.');
  } catch (error) {
    console.error('Unable to sync models with the database:', error);
  }
}

// Check database connection and sync models
async function initialize() {
  try {
    await sequelize.sync({ alter: true });

    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await syncModels();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initialize();

checkDatabaseConnection();
// Routes
app.use('/user', userRoute);
app.use('/clinic', clinicRoute);
app.use('/ModelRoute', ModelRoute);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});