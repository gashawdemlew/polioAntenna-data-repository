const express = require('express');
const router = express.Router();

const userController = require('../controllers/clinical_info'); // Updated path

// Define the routes
router.post('/post', userController.register,);
router.post('/create', userController.uploadFiles, userController.create);
router.post('/upload', userController.uploadFiles, userController.createVol);

router.post('/prtientdemographi', userController.prtientdemographi);
router.get('/demoByVolunter', userController.demoByVolunter);
router.get('/demoByVolunter', userController.demoByVolunter);

router.post('/registerStool', userController.registerStool);

router.post('/clinicalHistory', userController.clinicalHistory);
router.post('/StoolSpeciement', userController.StoolSpeciement);
router.post('/enviroment', userController.enviroment);
router.post('/labstoolDoc', userController.labstoolDoc);
router.post('/followup', userController.followup);
router.delete('/deletData', userController.deletData);
router.get('/getData', userController.getData);
router.get('/getDataByUserId/:user_id', userController.getDataByUserId);

















router.get('/getMessage676', userController.getMessages);
router.put('/messages23/:push_id', userController.updateMessageStatus);


module.exports = router;