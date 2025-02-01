const express = require('express');
const { fetchAllData, fetchDataByEpidNumber, createData } = require("../controllers/modelController");

const router = express.Router();

// Route to fetch all data
router.get('/data', fetchAllData);
router.get('/data/:epid_number(*)', fetchDataByEpidNumber);

// Route to create new data
router.post('/data', createData);

module.exports = router;