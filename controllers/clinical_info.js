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
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const JWT = process.env.JWT_SECRET;

const generateEpidNumber = async () => {
  try {
    const epidCount = await clinicalModel.count() || 0;
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
    const {
      latitude,
      longitude,
      first_name,
      phonNo,
      last_name,
      gender,
      dateofbirth,
      region,
      zone,
      woreda,
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
      dateStool1,
      dateStool2,
      date_after_onset,
      date_stool_1_collected,
      date_stool_2_collected,
      date_stool_1_sent_lab,
      date_stool_2_sent_lab,
      case_contact,
      stool1DaysAfterOnset,
      stool2DaysAfterOnset,
      stool1DateReceivedByLab,
      stool2DateReceivedByLab,
      specimenCondition,
      date_follow_up_investigation,
      residual_paralysis,
      tempreture,
      rainfall,
      humidity,
      snow,
      hofficer_name,
      hofficer_phonno
    } = req.body;

    try {
      const epid_number = await generateEpidNumber();
      const currentDate = new Date().toLocaleDateString();
      const completeEpidNumber = `${region}-${zone}-${woreda}-${currentDate}-${epid_number}`;

      const patientDoc = new patientdemModel({
        latitude,
        longitude,
        epid_number: completeEpidNumber,
        first_name,
        phonNo,
        last_name,
        gender,
        dateofbirth,
        region,
        zone,
        woreda,
      });

      const clinicalDoc = new clinicalModel({
        epid_number: completeEpidNumber,
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
      });

      const stool1Doc = new stoolspecimanModel({
        epid_number: completeEpidNumber,
        date_stool_1_collected,
        date_stool_2_collected,
        date_stool_1_sent_lab,
        date_stool_2_sent_lab,
        case_contact,
      });

      const envModel = new environmentModel({
        epid_number: completeEpidNumber,
        tempreture,
        rainfall,
        humidity,
        snow,
      });

      const followupDoc = new followupModel({
        epid_number: completeEpidNumber,
        date_follow_up_investigation,
        residual_paralysis,
      });

      const labstoolDoc = new labstoolModel({
        epid_number: completeEpidNumber,
        specimenCondition,
        stool1DateReceivedByLab,
        stool2DateReceivedByLab,
      });

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

      // Handle file uploads
      const multimediaData = {
        epid_number: completeEpidNumber,
      };

      if (req.files && req.files.image) {
        const { path: filePath } = req.files.image[0];
        multimediaData.image_path = filePath;
      }

      if (req.files && req.files.video) {
        const { path: filePath } = req.files.video[0];
        multimediaData.video_path = filePath;
      }

      const multimediaDoc = new multimediaModel(multimediaData);

      await Promise.all([
        patientDoc.save(),
        clinicalDoc.save(),
        pushMessage.save(),
        stool1Doc.save(),
        envModel.save(),
        followupDoc.save(),
        labstoolDoc.save(),
        multimediaDoc.save(),
      ]);

      res.status(201).json({ message: 'Documents created successfully' });
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


  register: async (req, res) => {
    try {
      const {
        epid_number,
        true_afp,
        final_cell_culture_result,
        date_cell_culture_result,
        final_combined_itd_result,
      } = req.body;
  
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
  


};
