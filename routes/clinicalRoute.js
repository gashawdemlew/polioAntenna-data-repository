const express = require('express');
const router = express.Router();

const userController = require('../controllers/clinical_info'); // Updated path

// Define the routes
router.post('/post', userController.register,);
router.post('/create', userController.uploadFiles, userController.create);
router.post('/upload', userController.uploadFiles, userController.createVol);
router.get('/records', userController.getAllVols);

router.get('/getAllMultimedia(*)', userController.GetAllMultimedia);


router.post('/prtientdemographi', userController.prtientdemographi);
router.get('/demoByVolunter', userController.demoByVolunteer);
// router.get('/demoByVolunter', userController.demoByVolunteer);

router.post('/registerStool', userController.registerStool);

router.post('/clinicalHistory', userController.clinicalHistory);
router.post('/StoolSpeciement', userController.StoolSpeciement);
router.post('/enviroment', userController.enviroment);
router.post('/labstoolDoc', userController.labstoolDoc);
router.post('/followup', userController.followup);
router.delete('/deletData', userController.deletData);
router.get('/getData/:user_id', userController.getData);
router.get('/getData1', userController.getData1);
router.get('/getDataByEpidNumber/:epid_number(*)', userController.getDataByEpidNumber);
router.get('/getDataFormodels/:epid_number(*)', userController.getDataFormodels);

router.put('/updateCommiteResult/:epid_number(*)', userController.updateCommiteResult);



router.get('/getDataByUserId/:user_id', userController.getDataByUserId);
router.get('/getDataByUserIdCompleted/:user_id', userController.getDataByUserIdCompleted);

router.get('/getCommitte', userController.getCommite);




router.delete('/deleteDataById/:petient_id', userController.deleteDataById);


















router.get('/getMessage676', userController.getMessages);
router.put('/messages23/:id', userController.updateMessageStatus);


module.exports = router;