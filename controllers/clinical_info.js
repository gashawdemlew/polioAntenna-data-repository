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

const generateEpidNumber = async () => {
  const epidCount = await clinicalModel.countDocuments();
  return `E-${(epidCount + 1).toString().padStart(3, '0')}`;
};

module.exports = {
  create: async (req, res) => {
    const {
      latitude,
      longitude,
      epid_number,
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
    } = req.body;

    try {


      const petientDoc = new patientdemModel({


        latitude,
        longitude,
        epid_number,
        first_name,
        phonNo,
        last_name,
        gender,
        dateofbirth,
        region,
        zone,
        woreda,
      })
      // Create and save documents in the respective collections
      const clinicalDoc = new clinicalModel({
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
        date_stool_1_collected,
        date_stool_2_collected,
        date_stool_1_sent_lab,
        date_stool_2_sent_lab,
        case_contact,
      });

    

      const followupDoc = new followupModel({
        date_follow_up_investigation,
        residual_paralysis,
        paralysis_progressed,
      });

      const labstoolDoc = new labstoolModel({
        specimenCondition,
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
        tempreture,
        rainfall,
        humidity,
        snow,
      });

      await Promise.all([
        clinicalDoc.save(),
        stool1Doc.save(),
        stool2Doc.save(),
        followupDoc.save(),
        labstoolDoc.save(),
      ]);

      res.status(201).json({ message: 'Documents created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the documents' });
    }
  },
};
