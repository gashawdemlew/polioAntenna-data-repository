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

require('dotenv').config();

const JWT = process.env.JWT_SECRET;

// if (!JWT) {
//   throw new Error("JWT_SECRET is not defined in environment variables");
// }

// Function to generate a new EPID number
const generateEpidNumber = async () => {
  const epidCount = await clinicalModel.count();
  return `E-${(epidCount + 1).toString().padStart(3, '0')}`;
};

module.exports = {
  create: async (req, res) => {
    const {
      date_after_onset = null,
      fever_at_onset = null,
      flaccid_sudden_paralysis = null,
      paralysis_progressed = null,
      asymmetric = null,
      site_of_paralysis = null,
      total_opv_doses = null,
      admitted_to_hospital = null,
      date_of_admission = null,
      medical_record_no = null,
      facility_name = null
    } = req.body;

    console.log(req.body);

    try {
      // Generate a new EPID number
      const epidNumber = await generateEpidNumber();

      // Create a new clinical history record
      const newClinicalHistory = await clinicalModel.create({
        epid_number: epidNumber,
        date_after_onset,
        fever_at_onset,
        flaccid_sudden_paralysis,
        paralysis_progressed,
        asymmetric,
        site_of_paralysis,
        total_opv_doses,
        admitted_to_hospital,
        date_of_admission,
        medical_record_no,
        facility_name
      });

      res.status(200).json({ message: "Clinical History registered successfully", newClinicalHistory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error: Failed to register clinical history' });
    }
  },
};
