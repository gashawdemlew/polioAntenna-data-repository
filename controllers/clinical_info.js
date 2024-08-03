const clinicalModel = require('../models/clinicalHistoryModel');
const demographiVolModel = require('../models/demographic_by_vol');
const environmentModel = require('../models/enviroment_info');
const followupModel = require('../models/followup_investigation');
const labstoolModel = require('../models/lab_stool_info');
const labratoryModel = require('../models/labratory_info');
const multimediaModel = require('../models/multimedia_info');
const patientdemModel = require('../models/petient_demography');
const pushMessageModel = require('../models/push_message_labspec');
const stoolspecimanModel = require('../models/stool_speciement_info');
const progress = require('../models/progress');
const User = require('../models/userModel');

const { Op } = require('sequelize');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClinicalHistory = require('../models/clinicalHistoryModel');
require('dotenv').config();

const JWT = process.env.JWT_SECRET;

const generateEpidNumber = async () => {
  try {
    const epidCount = await patientdemModel.count() || 0;
    if (epidCount === 0) {
      return 'E-001'; // Or any default value you prefer
    }
    return `E-${(epidCount + 1).toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating EPID number:', error);
    throw new Error('Error generating EPID number');
  }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Ensure the upload directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = {
  create: async (req, res) => {
    const { hofficer_name, hofficer_phonno, epid_number } = req.body;
    console.log(req.body);
  
    if (!epid_number) {
      return res.status(400).json({ error: 'epid_number is required' });
    }
  
    try {
      // Handle file uploads
      const multimediaData = { epid_number };
  
      if (req.files && req.files.image) {
        const { path: filePath } = req.files.image[0];
        multimediaData.image_path = filePath;
      }
  
      if (req.files && req.files.video) {
        const { path: filePath } = req.files.video[0];
        multimediaData.video_path = filePath;
      }
  
      const multimediaDoc = new multimediaModel(multimediaData);
  
      const patient = await patientdemModel.findOne({ where: { epid_number } });
  
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
  
      const pushMessage = new pushMessageModel({
        epid_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        hofficer_name,
        hofficer_phonno,
        region: patient.region,
        zone: patient.zone,
        woreda: patient.woreda,
        status: "unseen"
      });
  
      patient.progressNo = 'completed';
      await patient.save();
  
      await Promise.all([
        multimediaDoc.save(),
        pushMessage.save(),
      ]);
  
      res.status(201).json(pushMessage );
  console.log(`RRRRRRRRRR ${pushMessage}`)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the documents' });
    }
  },
  
  createVol: async (req, res) => {
    const { first_name, last_name,region,woreda,zone, hofficer_name,lat,long } = req.body;
    console.log(req.body);
  
    try {
      // Handle file uploads
      const multimediaData = {
        first_name,
        last_name,
        hofficer_name,
        region,woreda,zone,
      };
  
      if (req.files && req.files.image) {
        const { path: filePath } = req.files.image[0];
        multimediaData.image_path = filePath;
      }
  
      if (req.files && req.files.video) {
        const { path: filePath } = req.files.video[0];
        multimediaData.video_path = filePath;
      }
  
      const multimediaDoc = new demographiVolModel(multimediaData);
  
      await multimediaDoc.save();
  
      res.status(201).json(multimediaDoc);
      console.log(`RRRRRRRRRR ${multimediaDoc}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the documents' });
    }
  },
  


  uploadFiles: upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]),

  getMessages: (req, res) => {
    pushMessageModel.findAll()
      .then((messages) => {
        res.json(messages);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve messages' });
      });
  },
  getData: (req, res) => {
    labstoolModel.findAll()
      .then((messages) => {
        res.json(messages);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve messages' });
      });
  },

  
  getDataByUserId: async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const data = await patientdemModel.findAll({
        where: {
          user_id: user_id,
          progressNo: {
            [Op.ne]: 'completed'
          }
        }
      });
  
      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  getStoolData: async (req, res) => {
    try {
      const data = await labstoolModel.findAll();
      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  getStoolByUserId: async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const data = await patientdemModel.findAll({
        where: {
          user_id: user_id,
          progressNo: {
            [Op.ne]: 'completed'
          }
        }
      });
  
      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  deletData: (req, res) => {
    clinicalModel.destroy({
      where: {},
      truncate: true
    })
    .then((rowsDeleted) => {
      res.json({ message: `${rowsDeleted} records deleted` });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to delete records' });
    });
  },

  register: async (req, res) => {
    try {
      const {
        epid_number,
        true_afp,
        final_cell_culture_result,
        date_cell_culture_result,
        final_combined_itd_result,
      } = req.body;
      const message = await labstoolModel.findOne({ where: { epid_number: epid_number } });
      console.log(message);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.completed = 'true';
      message.save();
      const newLabInfo = await labratoryModel.create({
        epid_number,
        true_afp,
        final_cell_culture_result,
        date_cell_culture_result,
        final_combined_itd_result,
      });
  
      res.status(201).json(newLabInfo);
    } catch (error) {
      console.error('Error creating lab info:', error);
      res.status(500).json({ error: 'Error creating lab info' });
    }
  },
  registerStool: async (req, res) => {
    try {
      // Validate request body
      const { epid_number, stool_recieved_date, speciement_condition,user_id, type } = req.body;
      if (!epid_number || !stool_recieved_date || !speciement_condition || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // Create new lab stool entry
      const labForm = await labstoolModel.create({
        epid_number,
        stool_recieved_date,
        speciement_condition,
        type,
        user_id,
        completed: "false"
      });
  
      // Respond with the created entry
      res.status(201).json({
        success: true,
        message: 'Lab stool entry created successfully',
        data: labForm
      });
  
    } catch (error) {
      // Log error and respond with error message
      console.error('Error registering stool:', error.message);
      res.status(500).json({
        success: false,
        message: 'An error occurred while registering the stool',
        error: error.message
      });
    }
  },
  


  updateMessageStatus: async (req, res) => {
    try {
      console.log('Request params:', req.params); // Log the request parameters
      const { push_id } = req.params;
  
      if (!push_id) {
        return res.status(400).json({ error: 'push_id parameter is required' });
      }
  
      const message = await pushMessageModel.findOne({ where: { push_id: push_id } });
  
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.status = 'seen';
      await message.save();
  
      res.json({ message: 'Message status updated to seen' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the message status' });
    }
  },


  prtientdemographi: async (req, res) => {
    const {
      latitude,
      longitude,
      first_name,
      phoneNo,
      last_name,
      gender,
      dateofbirth,
      region,
      zone,
      woreda,
      user_id,

    } = req.body;
    try {
      const epid_number = await generateEpidNumber();
      const currentDate = new Date().toLocaleDateString();
      const completeEpidNumber = `${region}-${zone}-${woreda}-${currentDate}-${epid_number}`;
      const patientDoc = new patientdemModel({
        lat:latitude,
        long:longitude,
        epid_number: completeEpidNumber,
        first_name,
        phoneNo,
        last_name,
        gender,
        dateofbirth,
        region,
        zone,
        woreda,
        user_id,
        progressNo:"1",
      });

     console.log(req.body);
      const progresss = new progress({
   
        epid_number: completeEpidNumber,
        progressNo:"1",
 
    
      });

      await Promise.all([
        patientDoc.save(),
        progresss.save(),
      ]);

      res.status(201).json(patientDoc);
    } catch (error) {
      console.error(' info:', error);
      res.status(500).json({ error: 'Error creating lab info' });
    }
  },



  
  clinicalHistory: async (req, res) => {
    const {
      epid_number,
      fever_at_onset,
      flaccid_sudden_paralysis,
      paralysis_progressed,
      asymmetric,
      site_of_paralysis,
      total_opv_doses,
      admitted_to_hospital,
      date_of_admission,
      medical_record_no,
      facility_name,
user_id,
    } = req.body;
    console.log(req.body);
    try {
      // const epid_number = await generateEpidNumber();
      // const currentDate = new Date().toLocaleDateString();
      // const completeEpidNumber = `${region}-${zone}-${woreda}-${currentDate}-${epid_number}`;

      // const { epid_number } = req.body;
  
   
  
      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.progressNo = '2';
      await message.save();
        const clinicalDoc = new clinicalModel({
          epid_number,
          fever_at_onset,
          flaccid_sudden_paralysis,
          paralysis_progressed,
          asymmetric,
          site_of_paralysis,
          total_opv_doses,
          admitted_to_hospital,
          date_of_admission,
          medical_record_no,
          facility_name,
          user_id,
      });
      clinicalDoc.save();
      res.status(201).json(clinicalDoc);
    } catch (error) {
      console.error('Error creating lab info:', error);
      res.status(500).json({ error: 'Error creating data' });
    }
  },
  
  StoolSpeciement: async (req, res) => {
    const {
      epid_number,
      date_stool_1_collected,
      date_stool_2_collected,
      date_stool_1_sent_lab,
      date_stool_2_sent_lab,
      site_of_paralysis,
      user_id

    } = req.body;
    console.log(req.body);

    try {

      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });
      console.log(message);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.progressNo = '3';
      message.save();

      const stool1Doc = new stoolspecimanModel({
        epid_number,
        date_stool_1_collected,
        date_stool_2_collected,
        date_stool_1_sent_lab,
        date_stool_2_sent_lab,
        site_of_paralysis,
        user_id
      });
      stool1Doc.save();
      res.status(201).json(stool1Doc);
    } catch (error) {
      console.error('Error creating data:', error);
      res.status(500).json({ error: 'Error creating data ' });
    }
  },
  enviroment: async (req, res) => {
    const {
      epid_number,
      tempreture,
      rainfall,
      humidity,
      snow,
      user_id
     
    } = req.body;
    try {
 
      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });
      console.log(message);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.progressNo = '5';
      message.save();
      const envModel = new environmentModel({
        epid_number,
        tempreture,
        rainfall,
        humidity,
        snow,
        user_id,
      
      });

      envModel.save();
      res.status(201).json(envModel);
    } catch (error) {
      console.error('Error creating data:', error);
      res.status(500).json({ error: 'Error creating data ' });
    }
  },

  followup: async (req, res) => {
    const {
      epid_number,
      date_follow_up_investigation,
      residual_paralysis,
      user_id,
    } = req.body;
    try {
      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });
      console.log(message);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      message.progressNo = '4';
      message.save();

      const followupDoc = new followupModel({
        epid_number,
        date_follow_up_investigation,
        residual_paralysis,
        user_id,
      });

      followupDoc.save();
      res.status(201).json(followupDoc);
    } catch (error) {
      console.error('Error creating data:', error);
      res.status(500).json({ error: 'Error creating data ' });
    }
  },

  demoByVolunter: async (req, res) => {
    const { woreda, region, zone } = req.query;
    console.log(req.query);
  
    // Construct a query object conditionally
    let query = {};
  
    // Check if the values exist in the user table
    const existingUsers = await User.findAll({
      attributes: ['woreda', 'region', 'zone'],
      group: ['woreda', 'region', 'zone'],
    });
  
    const existingWoredas = existingUsers.map(user => user.woreda);
    const existingRegions = existingUsers.map(user => user.region);
    const existingZones = existingUsers.map(user => user.zone);
  
    // Priority 1: All three values match
    if (woreda && region && zone && 
        existingWoredas.includes(woreda) && 
        existingRegions.includes(region) && 
        existingZones.includes(zone)) {
      query = { woreda, region, zone };
    } 
    // Priority 2: Woreda and Zone match
    else if (woreda && zone && 
             existingWoredas.includes(woreda) && 
             existingZones.includes(zone)) {
      query = { woreda, zone };
    } 
    // Priority 3: Only Woreda matches
    else if (woreda && existingWoredas.includes(woreda)) {
      query = { woreda };
    }
  
    try {
      const users = await User.findAll({
        where: query,
      });
  
      res.json(users);
      console.log(users);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  },
  
  
    


 

  labstoolDoc: async (req, res) => {
    const {
 
      stool1DateReceivedByLab,
      stool2DateReceivedByLab,
      specimenCondition,
 
    } = req.body;
    try {
      const epid_number = await generateEpidNumber();
      const currentDate = new Date().toLocaleDateString();
      const completeEpidNumber = `${region}-${zone}-${woreda}-${currentDate}-${epid_number}`;

      const labstoolDoc = new labstoolModel({
        epid_number: completeEpidNumber,
        specimenCondition,
        stool1DateReceivedByLab,
        stool2DateReceivedByLab,
      });

      labstoolDoc.save();
      res.status(201).json(labstoolDoc);
    } catch (error) {
      console.error('Error creating data:', error);
      res.status(500).json({ error: 'Error creating data ' });
    }
  },

  labstoolDoc: async (req, res) => {
    const {
   
      first_name,
    
      last_name,

      region,
      zone,
      woreda,

      hofficer_name,
      hofficer_phonno
    } = req.body;

  
    try {
  
      const epid_number = await generateEpidNumber();
      const currentDate = new Date().toLocaleDateString();
      const completeEpidNumber = `${region}-${zone}-${woreda}-${currentDate}-${epid_number}`;
      const pushMessage = new pushMessageModel({
        epid_number: completeEpidNumber,
        first_name,
        last_name,
        hofficer_name,
        hofficer_phonno,
        region,
        zone,
        woreda,
        status: "unseen"
      });

      pushMessage.save();
      res.status(201).json(pushMessage);
    } catch (error) {
      console.error('Error creating data:', error);
      res.status(500).json({ error: 'Error creating data ' });
    }
  },
};



