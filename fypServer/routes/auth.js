const express = require("express");
const router = express.Router();
const auth = require('../controllers/auth');
const teacherModule = require('./teacher')
const studentModule = require("./student")
const path=require('path')

router.use('/login/teacher', teacherModule);
router.use('/student', studentModule);


router.post("/login", auth.teacherLoginController);

router.post("/signup", auth.teacherSignupController);
const multer = require('multer');
var upload = multer({ dest:path.join(path.dirname(process.mainModule.filename),'public','uploads') });

router.post("/signup/student",upload.single('data'),auth.saveVoiceController);



module.exports = router;