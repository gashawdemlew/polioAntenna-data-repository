const imageModel = require('../models/imageModel');
const methrologymodel = require('../models/methrologymodel');


// Fetch all records
const fetchAllData = async (req, res) => {
    try {
        const data = await imageModel.findAll();
        const data1 = await methrologymodel.findAll();

        // Return both datasets in a single JSON object
        res.status(200).json({ images: data, methodologies: data1 });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Fetch records by epid_number
const fetchDataByEpidNumber = async (req, res) => {
    const { epid_number } = req.params; // Get epid_number from request parameters

    try {
        const imageData = await imageModel.findAll({
            where: { epid_number } // Filter by epid_number
        });
        const methodologyData = await methrologymodel.findAll({
            where: { epid_number } // Filter by epid_number
        });

        res.status(200).json({ images: imageData, methodologies: methodologyData });
    } catch (error) {
        console.error('Error fetching data by epid_number:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new record
const createData = async (req, res) => {
    const { message, epid_number, suspected, confidence_interval, message1, suspected1, confidence_interval1 } = req.body;

    try {
        const newData = await imageModel.create({
            message,
            epid_number,
            suspected,
            confidence_interval,

        });

        const newData1 = await methrologymodel.create({
            message: message1,
            epid_number,
            suspected: suspected1,
            confidence_interval: confidence_interval1,

        });
        res.status(201).json(newData);
    } catch (error) {
        console.error('Error creating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    fetchAllData,
    fetchDataByEpidNumber,
    createData
};