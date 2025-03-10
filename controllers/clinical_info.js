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
const Committe = require('../models/commite_ressult');
const handbrake = require('handbrake-js'); // Alternative for video compression
const methrologymodel = require('../models/methrologymodel');

const sharp = require('sharp');


const { Op } = require('sequelize');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ClinicalHistory = require('../models/clinicalHistoryModel');
require('dotenv').config();
// --- Configuration (Move to config file or env vars) ---

// Configuration
const MAX_IMAGE_WIDTH = 800;
const MAX_IMAGE_HEIGHT = 600;
const VIDEO_PRESET = 'Very Fast 1080p30'; // Use a valid preset name
const uploadPath = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Image processing
const processImage = async (filePath) => {
  const compressedPath = `${filePath.split('.')[0]}_compressed.webp`;
  try {
    await sharp(filePath)
      .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(compressedPath);
    await fs.promises.unlink(filePath);
    return compressedPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Video processing
const processVideo = async (filePath) => {
  const compressedPath = `${filePath.split('.')[0]}_compressed.mp4`;
  return new Promise((resolve, reject) => {
    handbrake
      .spawn({
        input: filePath,
        output: compressedPath,
        preset: VIDEO_PRESET,
      })
      .on('complete', async () => {
        await fs.promises.unlink(filePath);
        resolve(compressedPath);
      })
      .on('error', (err) => {
        console.error('Error processing video:', err);
        reject('Failed to process video');
      });
  });
};


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

module.exports = {




  create: async (req, res) => {
    const { hofficer_name, hofficer_phonno, epid_number, message, confidence_interval, prediction } = req.body;
    console.log("Request Body:", req.body);

    if (!epid_number) {
      return res.status(400).json({ error: 'epid_number is required' });
    }

    try {
      const multimediaData = { epid_number };  // Always have epid_number

      // Determine if we created or updated the record
      let methrologymodelInstance = await methrologymodel.findOne({ where: { epid_number: String(epid_number) } });
      let recordCreated = false;  // Flag to track create/update

      if (methrologymodelInstance) {
        // Update existing record
        console.log("Updating existing methrologymodel record...");
        methrologymodelInstance.message = message;
        methrologymodelInstance.prediction = prediction;
        methrologymodelInstance.confidence_interval = confidence_interval;
        await methrologymodelInstance.save();
        console.log("methrologymodel updated:", methrologymodelInstance.toJSON());
      } else {
        // Create new record
        console.log("Creating new methrologymodel record...");
        methrologymodelInstance = await methrologymodel.create({
          message,
          epid_number: String(epid_number),
          prediction,
          confidence_interval,
        });
        recordCreated = true;  // Set the flag
        console.log("methrologymodel created:", methrologymodelInstance.toJSON());
      }

      console.log(`methrologymodel ${recordCreated ? 'created' : 'updated'}:`, methrologymodelInstance.toJSON());

      const baseUrl = `${req.protocol}://${req.get('host')}`; // Construct the base URL
      // multimediaData.viedeo_path = `${baseUrl}/${videoPath}`; // Store the full URL


      // Process file uploads

      if (req.files) {
        if (req.files.image) {
          try {
            multimediaData.iamge_path = req.files.image[0].path;  //Use path directly after upload, no processing needed.
            // multimediaData.viedeo_path = `${baseUrl}/${videoPath}`; // Store the full URL

          } catch (err) {
            console.error("Image Processing Error:", err);
            return res.status(500).json({ error: `Image processing failed: ${err.message}` });
          }
        }
        if (req.files.video) {
          try {
            multimediaData.viedeo_path = req.files.video[0].path; //Use path directly after upload, no processing needed.
          } catch (err) {
            console.error("Video Processing Error:", err);
            return res.status(500).json({ error: `Video processing failed: ${err.message}` });
          }
        }
      }

      // Find patient by epid_number
      const patient = await patientdemModel.findOne({ where: { epid_number } });

      if (!patient) {
        console.error(`Patient not found with epid_number: ${epid_number}`);
        return res.status(404).json({ error: 'Patient not found' });
      }
      console.log("Patient Found:", patient.toJSON());

      // Check if a push message already exists for the epid_number
      const existingPushMessage = await pushMessageModel.findOne({ where: { epid_number } });

      if (existingPushMessage) {
        console.log("Existing push message found, updating it:");
        existingPushMessage.hofficer_name = hofficer_name;
        existingPushMessage.hofficer_phonno = hofficer_phonno;
        existingPushMessage.region = patient.region;
        existingPushMessage.zone = patient.zone;
        existingPushMessage.woreda = patient.woreda;
        existingPushMessage.status = 'unseen';

        patient.progressNo = 'completed';

        await Promise.all([
          existingPushMessage.save(),
          patient.save(),
          multimediaModel.upsert(multimediaData, { where: { epid_number } }),
        ]);

        console.log("Updated push message:", existingPushMessage.toJSON());
        return res.status(200).json(existingPushMessage);
      }

      // Create new push message if none exists
      console.log("No existing push message found, creating new one");
      const pushMessage = new pushMessageModel({
        epid_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        hofficer_name,
        hofficer_phonno,
        region: patient.region,
        zone: patient.zone,
        woreda: patient.woreda,
        status: 'unseen',
      });

      patient.progressNo = 'completed';
      // Persist all data
      await Promise.all([
        multimediaModel.upsert(multimediaData, { where: { epid_number: multimediaData.epid_number } }),
        pushMessage.save(),
        patient.save(),
      ]);

      console.log("Created new push message:", pushMessage.toJSON());
      res.status(201).json(pushMessage);

    } catch (err) {
      console.error("General Error:", err);
      res.status(500).json({ error: 'An error occurred while processing the request', details: err.message });
    }
  },


  createVol: async (req, res) => {
    const { first_name, last_name, user_id, region, woreda, zone, gender, phonNo, hofficer_name, lat, long } = req.body;
    console.log(req.body);

    try {
      // Handle file uploads
      const multimediaData = {
        first_name,
        last_name,
        selected_health_officcer: hofficer_name,
        region, woreda, zone, lat, long, gender, phonNo, user_id
      };

      const baseUrl = `${req.protocol}://${req.get('host')}`; // Construct the base URL
      // multimediaData.viedeo_path = `${baseUrl}/${videoPath}`; // Store the full URL


      if (req.files && req.files.image) {
        const imagePath = req.files.image[0].path;
        // const compressedImage = await processImage(imagePath);

        //  Create the full URL to the image
        multimediaData.iamge_path = imagePath; // Store the full URL
      }

      if (req.files && req.files.video) {
        const videoPath = req.files.video[0].path;

        //const compressedVideo = await processVideo(req.files.video[0].path);
        //  Create the full URL to the video
        multimediaData.viedeo_path = `${baseUrl}/${videoPath}`; // Store the full URL
      }

      const multimediaDoc = new demographiVolModel(multimediaData);

      await multimediaDoc.save();

      res.status(201).json(multimediaDoc);
      console.log(`RRRRRRRRRR ${multimediaDoc}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `An error occurred while creating the documents ${error} ` });
    }
  },

  // Fetch all demographic records
  getAllVols: async (req, res) => {
    try {
      // Fetch records from the database using Sequelize
      // const vols = await demographiVolModel.findAll();

      const { phonNo } = req.query;

      // Check if the phonNo query parameter is provided
      if (!phonNo) {
        return res.status(400).json({ error: "phonNo query parameter is required" });
      }

      // Fetch records from the database by phonNo
      const vols = await demographiVolModel.findAll({
        where: {
          selected_health_officcer: phonNo
        }
      });

      const baseUrl = `${req.protocol}s://${req.get('host')}`;
      const volsWithUrls = vols.map(vol => ({
        ...vol.dataValues,
        image_url: vol.iamge_path ? `${baseUrl}/uploads/${path.basename(vol.iamge_path)}` : null,
        video_url: vol.viedeo_path ? `${baseUrl}/uploads/${path.basename(vol.viedeo_path)}` : null
      }));

      res.status(200).json(volsWithUrls);
    } catch (error) {
      console.error('Error fetching demographic records:', error);
      res.status(500).json({ error: 'An error occurred while fetching the records' });
    }
  },




  GetAllMultimedia: async (req, res) => {
    try {
      // Fetch records from the database using Sequelize
      // const vols = await demographiVolModel.findAll();

      const { epid_number } = req.query;

      // Check if the phonNo query parameter is provided
      if (!epid_number) {
        return res.status(400).json({ error: "epid_number query parameter is required" });
      }

      // Fetch records from the database by phonNo
      const vols = await multimediaModel.findAll({
        where: {
          epid_number: epid_number
        }
      });

      const baseUrl = `${req.protocol}s://${req.get('host')}`;
      const volsWithUrls = vols.map(vol => ({
        ...vol.dataValues,
        image_url: vol.iamge_path ? `${baseUrl}/uploads/${path.basename(vol.iamge_path)}` : null,
        video_url: vol.viedeo_path ? `${baseUrl}/uploads/${path.basename(vol.viedeo_path)}` : null
      }));

      res.status(200).json(volsWithUrls);
    } catch (error) {
      console.error('Error fetching demographic records:', error);
      res.status(500).json({ error: 'An error occurred while fetching the records' });
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


  getCommite: (req, res) => {
    Committe.findAll()
      .then((messages) => {
        res.json(messages);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve messages' });
      });
  },
  getData1: (req, res) => {
    patientdemModel.findAll({
      where: {
        progressNo: "completed"
      },
      order: [['createdAt', 'DESC']]
    })
      .then((messages) => {
        if (!messages || messages.length === 0) {
          return res.status(404).json({ message: 'No completed patients found.' });
        }
        res.json(messages);
      })
      .catch((error) => {
        console.error("Error retrieving completed patients:", error);
        res.status(500).json({ error: 'Failed to retrieve completed patients.' });
      });
  },
  getData: async (req, res) => {
    const { user_id } = req.params;

    try {
      const data = await labstoolModel.findAll({
        where: {
          user_id: user_id,
          completed: {
            [Op.ne]: 'true'
          }
        }
      });

      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  getDataByUserIdCompleted: async (req, res) => {
    const { user_id } = req.params;

    try {
      const data = await patientdemModel.findAll({
        where: {
          user_id: user_id,
          progressNo: 'completed', // Change here to filter for completed
        },
        order: [['createdAt', 'DESC']], // Order by createdAt in descending order
      });

      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  getDataByUserId: async (req, res) => {
    const { user_id } = req.params;

    try {
      const data = await patientdemModel.findAll({
        where: {
          user_id: user_id,
          progressNo: {
            [Op.ne]: 'completed',
          },
        },
        order: [['createdAt', 'DESC']], // Order by createdAt in descending order
      });

      res.json(data);
    } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    }
  },

  deleteDataById: async (req, res) => {
    const { petient_id } = req.params;

    try {
      const data = await patientdemModel.destroy({
        where: {
          petient_id: petient_id
        }
      });

      if (data === 0) {
        return res.status(404).json({ error: 'No record found with this ID' });
      }

      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'Failed to delete record' });
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
    labstoolModel.destroy()
      .then((rowsDeleted) => {
        res.json({ message: `${rowsDeleted} records deleted` });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to delete records' });
      });
  },
  register: async (req, res) => {
    const {
      epid_number,
      true_afp,
      user_id,
      final_cell_culture_result,
      date_cell_culture_result,
      final_combined_itd_result,
      type
    } = req.body;

    try {
      // Find the related message for the given epid_number and type
      const message = await labstoolModel.findOne({
        where: { epid_number, type: type }
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      message.completed = 'true';



      // Find existing record
      let existingRecord = await labratoryModel.findOne({
        where: { epid_number, type }
      });

      let stool = await patientdemModel.findOne({ where: { epid_number } });




      const onsetDate = new Date(date_cell_culture_result);
      const birthDate = new Date(stool.dateofbirth);

      if (onsetDate <= birthDate) {
        return res.status(400).json({ error: ' date_cell_culture_result date should be greater than  patient date of birth' });
      }


      // Update or create lab record
      if (existingRecord) {
        // Update fields of the existing record
        existingRecord.true_afp = true_afp;
        existingRecord.final_cell_culture_result = final_cell_culture_result;
        existingRecord.date_cell_culture_result = date_cell_culture_result;
        existingRecord.final_combined_itd_result = final_combined_itd_result;
        existingRecord.user_id = user_id;

      } else {
        // Create a new record
        existingRecord = labratoryModel.build({
          epid_number,
          true_afp,
          final_cell_culture_result,
          date_cell_culture_result,
          final_combined_itd_result,
          user_id,
        });
      }

      // Save both the lab record and message in parallel
      await Promise.all([existingRecord.save(), message.save()]);

      const responseMessage = existingRecord.isNewRecord
        ? 'Lab record created successfully'
        : 'Lab record updated successfully';

      return res.status(200).json({
        message: responseMessage,
        data: existingRecord
      });

    } catch (error) {
      console.error('Error creating/updating lab info:', error);
      return res.status(500).json({ error: 'An error occurred while processing the lab record.' });
    }
  },

  registerStool: async (req, res) => {
    const { epid_number, stool_recieved_date, completed, speciement_condition, user_id, type } = req.body;
    console.log(req.body);



    try {
      // Check if a record already exists based on epid_number and type
      let existingRecord = await labstoolModel.findOne({ where: { epid_number, type } });
      let stool = await patientdemModel.findOne({ where: { epid_number } });


      const onsetDate = new Date(stool_recieved_date);
      const birthDate = new Date(stool.dateofbirth);

      if (onsetDate <= birthDate) {
        return res.status(400).json({ error: 'Stool Recived date should be greater than  patient date of birth' });
      }



      if (existingRecord) {
        // Update the existing record
        existingRecord.stool_recieved_date = stool_recieved_date;
        existingRecord.speciement_condition = speciement_condition;
        existingRecord.user_id = user_id;
        existingRecord.completed = completed;
        await existingRecord.save();

        return res.status(200).json({
          success: true,
          message: 'Lab stool entry updated successfully',
          data: existingRecord
        });
      }

      // Create a new record if no existing record is found
      const newLabForm = await labstoolModel.create({
        epid_number,
        stool_recieved_date,
        speciement_condition,
        type,
        user_id,
        completed
      });

      if (stool) {
        stool.lab_stool = "recieved";
        await stool.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Lab stool entry created successfully',
        data: newLabForm
      });

    } catch (error) {
      console.error('Error registering stool:', error.message);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while registering the stool',
        error: error.message
      });
    }
  },



  updateCommiteResult: async (req, res) => {
    try {
      console.log('Request params:', req.params); // Log the request parameters
      const { epid_number } = req.params;
      const { phone_no, full_name, description, result, user_id } = req.body; // Extract fields from the request body

      console.log(req.body);

      if (!epid_number) {
        return res.status(400).json({ error: 'id parameter is required' });
      }

      const message = await Committe.findOne({ where: { epid_number: epid_number } });

      const message1 = await patientdemModel.findOne({ where: { epid_number: epid_number } });


      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Update fields if provided
      if (phone_no) message.phone_no = phone_no;
      if (full_name) message.full_name = full_name;
      if (result)
        message.result = result;
      message1.result = result;


      if (user_id) message.user_id = user_id;
      if (description)
        message.description = description;


      await message.save();
      await message1.save();


      res.json({ message: 'Message updated successfully', data: message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while updating the message' });
    }
  },


  updateMessageStatus: async (req, res) => {
    try {
      console.log('Request params:', req.params); // Log the request parameters
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'id parameter is required' });
      }

      const message = await demographiVolModel.findOne({ where: { id: id } });

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
      const regionCode = region.slice(0, 2).toUpperCase();
      const zoneCode = zone.slice(0, 2).toUpperCase();
      const woredaCode = woreda.slice(0, 2).toUpperCase();
      const completeEpidNumber = `${regionCode}-${zoneCode}-${woredaCode}-${currentDate}-${epid_number}`;
      const patientDoc = new patientdemModel({
        lat: latitude,
        long: longitude,
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
        progressNo: "1",
      });
      const commite = new Committe({
        epid_number: completeEpidNumber,
      });


      console.log(req.body);
      const progresss = new progress({

        epid_number: completeEpidNumber,
        progressNo: "1",


      });

      await Promise.all([
        patientDoc.save(),
        progresss.save(),
        commite.save(),
      ]);

      res.status(201).json(commite);
      console.error(' info:', commite);

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
      date_after_onset,
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
      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });

      if (!message) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Convert both dates to Date objects
      const onsetDate = new Date(date_after_onset);
      const birthDate = new Date(message.dateofbirth);

      if (onsetDate <= birthDate) {
        return res.status(400).json({ error: 'date_after_onset should be greater than  patient date of birth' });
      }

      message.progressNo = '2';
      await message.save();

      const clinicalDoc = new clinicalModel({
        epid_number,
        fever_at_onset,
        flaccid_sudden_paralysis,
        paralysis_progressed,
        asymmetric,
        date_after_onset,
        site_of_paralysis,
        total_opv_doses,
        admitted_to_hospital,
        date_of_admission,
        medical_record_no,
        facility_name,
        user_id,
      });

      await clinicalDoc.save();
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
      // Find the patient record by epid_number
      const patientRecord = await patientdemModel.findOne({ where: { epid_number: epid_number } });

      const onsetDate = new Date(date_stool_1_collected);
      const onsetDate1 = new Date(date_stool_2_collected);

      const onsetDate2 = new Date(date_stool_1_sent_lab);

      const onsetDate3 = new Date(date_stool_2_sent_lab);

      const birthDate = new Date(patientRecord.dateofbirth);

      if (onsetDate <= birthDate) {
        return res.status(400).json({ error: 'date_stool_1_collected should be greater than  patient date of birth' });
      }

      if (onsetDate1 <= birthDate) {
        return res.status(400).json({ error: 'date_stool_2_collected should be greater than  patient date of birth' });
      }
      if (date_stool_1_sent_lab != null) {

        if (onsetDate2 <= birthDate) {
          return res.status(400).json({ error: 'date_stool_1_sent_lab should be greater than  patient date of birth' });
        }

      }
      if (date_stool_1_sent_lab != null) {
        if (onsetDate3 <= birthDate) {
          return res.status(400).json({ error: 'date_stool_2_sent_lab should be greater than  patient date of birth' });
        }

      }


      if (!patientRecord) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Update the progress number in the patient record


      // Check if a record with the same epid_number exists in stoolspecimanModel
      let stoolRecord = await stoolspecimanModel.findOne({ where: { epid_number: epid_number } });

      if (stoolRecord) {
        // If record exists, update it
        stoolRecord.date_stool_1_collected = date_stool_1_collected;
        stoolRecord.date_stool_2_collected = date_stool_2_collected;
        stoolRecord.date_stool_1_sent_lab = date_stool_1_sent_lab;
        stoolRecord.date_stool_2_sent_lab = date_stool_2_sent_lab;
        stoolRecord.site_of_paralysis = site_of_paralysis;
        stoolRecord.user_id = user_id;
        patientRecord.progressNo = '13';

        await stoolRecord.save();
        await patientRecord.save();

        res.status(200).json({ message: 'Record updated successfully', patientRecord });
      } else {
        // If record does not exist, create a new one
        stoolRecord = new stoolspecimanModel({
          epid_number,
          date_stool_1_collected,
          date_stool_2_collected,
          date_stool_1_sent_lab,
          date_stool_2_sent_lab,
          site_of_paralysis,
          user_id
        });
        patientRecord.progressNo = '12';
        await patientRecord.save();
        await stoolRecord.save();
        res.status(201).json({ message: 'New record created successfully', stoolRecord });
        // res.status(201).json(stoolRecord );

      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Error processing request' });
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
    console.log(req.body);
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
    console.log(req.body)
    try {
      const message = await patientdemModel.findOne({ where: { epid_number: epid_number } });


      const onsetDate = new Date(date_follow_up_investigation);
      const birthDate = new Date(message.dateofbirth);

      if (onsetDate <= birthDate) {
        return res.status(400).json({ error: 'date_follow_up_investigation should be greater than  patient date of birth' });
      }
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


  demoByVolunteer: async (req, res) => {
    const { woreda, region, zone } = req.query;
    console.log(req.query);

    try {
      // Retrieve unique combinations of woreda, region, and zone for "health officer" role
      const existingUsers = await User.findAll({
        attributes: ['woreda', 'region', 'zone'],
        where: { user_role: 'Health Officer' }, // Filter by role
        group: ['woreda', 'region', 'zone'],
        raw: true, // Use raw: true to get plain objects
      });

      let query = { user_role: 'Health Officer' }; // Ensure role is always part of the query

      // Priority 1: All three match
      if (woreda && region && zone) {
        const match = existingUsers.find(user =>
          user.woreda === woreda && user.region === region && user.zone === zone
        );
        if (match) query = { ...query, woreda, region, zone };
      }

      // Priority 2: Two match
      if (!Object.keys(query).length || Object.keys(query).length === 1) {
        if (woreda && zone) {
          const match = existingUsers.find(user =>
            user.woreda === woreda && user.zone === zone
          );
          if (match) query = { ...query, woreda, zone };
        }

        if (!Object.keys(query).length || Object.keys(query).length === 1 && region && zone) {
          const match = existingUsers.find(user =>
            user.region === region && user.zone === zone
          );
          if (match) query = { ...query, region, zone };
        }

        if (!Object.keys(query).length || Object.keys(query).length === 1 && woreda && region) {
          const match = existingUsers.find(user =>
            user.woreda === woreda && user.region === region
          );
          if (match) query = { ...query, woreda, region };
        }
      }

      // Priority 3: One match
      if (!Object.keys(query).length || Object.keys(query).length === 1) {
        if (woreda) {
          const match = existingUsers.find(user => user.woreda === woreda);
          if (match) query = { ...query, woreda };
        }

        if (!Object.keys(query).length || Object.keys(query).length === 1 && region) {
          const match = existingUsers.find(user => user.region === region);
          if (match) query = { ...query, region };
        }

        if (!Object.keys(query).length || Object.keys(query).length === 1 && zone) {
          const match = existingUsers.find(user => user.zone === zone);
          if (match) query = { ...query, zone };
        }
      }

      // Fetch filtered users
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
      const regionCode = region.slice(0, 2).toUpperCase();
      const zoneCode = zone.slice(0, 2).toUpperCase();
      const woredaCode = woreda.slice(0, 2).toUpperCase();
      const completeEpidNumber = `${regionCode}-${zoneCode}-${woredaCode}-${currentDate}-${epid_number}`;
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

  getDataByEpidNumber: async (req, res) => {
    const { epid_number } = req.params;
    console.log(`Received EPID Number: ${epid_number}`);

    if (!epid_number) {
      return res.status(400).json({ error: 'epid_number is required' });
    }

    try {
      const baseUrl = `${req.protocol}s://${req.get('host')}`;

      const models = [
        {
          name: 'Clinical History',
          model: clinicalModel,
          excludeFields: ['createdAt', 'updatedAt', 'epid_number', 'clinfo_id', 'user_id']
        },
        { name: 'Follow-up Investigation', model: followupModel, excludeFields: ['createdAt', 'epid_number', 'updatedAt', 'followup_id', 'user_id'] },
        { name: 'Lab Stool Info', model: labstoolModel, excludeFields: ['createdAt', 'updatedAt', 'followup_id', 'epid_number', 'user_id'] },
        { name: 'Laboratory Info', model: labratoryModel, excludeFields: ['createdAt', 'updatedAt', 'followup_id', 'epid_number', 'user_id'] },
        { name: 'Multimedia Info', model: multimediaModel, excludeFields: ['createdAt', 'updatedAt', 'followup_id', 'epid_number', 'user_id'] },
        { name: 'Patient Demography', model: patientdemModel, excludeFields: ['createdAt', 'updatedAt', 'epid_number', "result", "dateofbirth", "progressNo", 'petient_id', 'followup_id', 'user_id'] },
        { name: 'Stool Specimen Info', model: stoolspecimanModel, excludeFields: ['createdAt', 'epid_number', "id", 'updatedAt', 'petient_id', 'user_id'] },
      ];

      // Execute all model queries in parallel
      const results = await Promise.all(
        models.map(async ({ name, model, excludeFields }) => {
          try {
            const queryOptions = {
              where: { epid_number },
              order: [['createdAt', 'DESC']],
            };

            if (excludeFields) {
              queryOptions.attributes = { exclude: excludeFields };
            }

            const data = await model.findOne(queryOptions);

            // If the model is Multimedia Info, construct custom URLs
            if (name === 'Multimedia Info' && data) {
              try {
                data.iamge_path = data.iamge_path ? `${baseUrl}/uploads/${path.basename(data.iamge_path)}` : null;
                data.viedeo_path = data.viedeo_path ? `${baseUrl}/uploads/${path.basename(data.viedeo_path)}` : null;



                console.error(`Error constructing multimedia URLs: ${data.iamge_path}`);
                console.error(`Error constructing multimedia URLs: ${data.viedeo_path}`);


              } catch (err) {
                console.error(`Error constructing multimedia URLs: ${err.message}`);
              }
            }


            return { name, data };
          } catch (err) {
            console.error(`Error fetching data for model "${name}":`, err.message);
            return { name, error: err.message };
          }
        })
      );

      // Separate successful results and errors
      const responseData = results.reduce(
        (acc, { name, data, error }) => {
          if (error) {
            acc.errors.push({ model: name, message: error });
          } else if (data) {
            acc.results[name] = data;
          } else {
            acc.results[name] = null; // Explicitly add null for clarity
          }
          return acc;
        },
        { results: {}, errors: [] }
      );

      // Send final response
      res.status(200).json({
        epid_number,
        results: responseData.results,
        errors: responseData.errors.length > 0 ? responseData.errors : null,
      });
    } catch (globalError) {
      console.error('Critical error occurred while fetching data:', globalError.message);
      res.status(500).json({
        error: 'An unexpected error occurred',
        details: globalError.message,
      });
    }
  },



  getDataFormodels: async (req, res) => {
    const { epid_number } = req.params;
    console.log(`Received EPID Number: ${epid_number}`);

    if (!epid_number) {
      return res.status(400).json({ error: 'epid_number is required' });
    }

    try {
      const models = [
        {
          name: 'Clinical History',
          model: clinicalModel,
          attributes: ['total_opv_doses'], // Fetch only this column
        },
        {
          name: 'Environment Info',
          model: environmentModel,
          attributes: ['tempreture', 'rainfall', 'humidity'], // Fetch these columns
        },
        {
          name: 'Patient Demography',
          model: patientdemModel,
          attributes: ['region', 'dateofbirth', 'gender'], // Fetch these columns
        },
      ];

      // Execute all model queries in parallel

      /////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////


      const results = await Promise.all(
        models.map(async ({ name, model, attributes }) => {
          try {
            const data = await model.findOne({
              where: { epid_number },
              attributes, // Include specific attributes
            });
            return { name, data };
          } catch (err) {
            console.error(`Error fetching data for model "${name}":`, err.message);
            return { name, error: err.message };
          }
        })
      );

      // Separate successful results and errors
      const responseData = results.reduce(
        (acc, { name, data, error }) => {
          if (error) {
            acc.errors.push({ model: name, message: error });
          } else if (data) {
            acc.results[name] = data;
          } else {
            acc.results[name] = null; // Explicitly add null for clarity
          }
          return acc;
        },
        { results: {}, errors: [] }
      );

      // Send final response
      res.status(200).json({
        epid_number,
        results: responseData.results,
        errors: responseData.errors.length > 0 ? responseData.errors : null,
      });
    } catch (globalError) {
      console.error('Critical error occurred while fetching data:', globalError.message);
      res.status(500).json({
        error: 'An unexpected error occurred',
        details: globalError.message,
      });
    }
  }

};



