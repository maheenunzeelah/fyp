const express = require("express");
const router = express.Router();
var jwt = require('jsonwebtoken');
const Tests = require("./models/Tests");
const Questions = require("./models/Question");
const Validator = require('validator');
var moment = require('moment');




function formatAMPM(date) {
    let month = (date.getMonth() + 1).toString();
    let dat = (date.getDate()).toString();
    let year = (date.getFullYear()).toString();
    let hour = (date.getHours()).toString();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = month + '/' + dat + '/' + year + '  ' + hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

//TEST CREATEION API 
router.post('/', (req, res) => {
    //Token received from axios header
    var token = req.headers.authorization;

    var testName = req.body.testName;
    var data = req.body;

    try {
        var decoded = jwt.verify(token, 'shhhh');
        teach = decoded.teacherid;
        //Insert teacher Id who has created test in Test table
        data.teacher = decoded.teacherid;

        //Create Test if that testName does not already exists
        Tests.find({ testName })
            .then(test => {
                var cond
                test.map(tes => {
                    cond = tes.teacher == teach
                })
                if (cond)
                    return res.status(400).json({ test: 'Test Name alreday exists' });
                else {
                    if (testName == undefined)
                        res.send("Enter Test name")
                    else {

                        const test = new Tests(data);
                        test.save()
                            .then(resolve => {
                                console.log(resolve);
                                res.send(resolve);

                            })
                            .catch((err) => {
                                res.send('Something went wrong')
                            })
                    }
                }
            })
    }
    catch (err) {
        console.log(err)
        res.status(401).send(err)
    }
})

// ADDING QUESTIONS IN CREATED TEST API
router.post('/addQues', (req, res) => {
    var token = req.headers.authorization
    var question = req.body.question;
    var data = req.body;
    console.log(data)
    try {
        var decoded = jwt.verify(token, 'shhhh');
        console.log(decoded);
        Questions.findOne({ question })
            .then(quest => {
                if (quest)
                    return res.status(400).json({ ques: 'Question alreday exists' });
                else {
                    if (question == undefined) {
                        res.send("Enter Question")
                    }
                    else {

                        d = formatAMPM(new Date);

                        data = { ...data, created_at: d }
                        console.log(data)
                        const question = new Questions(data);
                        question.save()
                            .then(resolve => {
                                console.log(resolve);
                                res.send('Question saved');
                            })
                            .catch((err) => {
                                res.send('Something went wrong')
                            })
                    }
                }
            })
    }
    catch (err) {
        console.log(err)
        res.status(401).send(err)
    }
})

router.delete('/delQues/:id',(req,res)=>{
    var token = req.headers['authorization'];
    var id = req.params.id;
    console.log(id)
    try {
        var decoded = jwt.verify(token, 'shhhh');
        Questions.remove({ _id: id })
            .then(resolve => {
                console.log("Delete Succesfully: ", resolve);
                res.send("Question Deleted");
            });
    }
    catch (err) {
        res.status(401).send(err);
    }  
})

//GET API FOR SENDING TEST DATA TO CLIENT
router.get('/tests', (req, res) => {
    var token = req.headers['authorization'];
    try {
        var decoded = jwt.verify(token, 'shhhh');
        var query = { teacher: decoded.teacherid };
        Tests.find(query, (error, response) => {
            if (error) {
                res.status(500);
                res.send(error);
                return
            }
            console.log(response);
            res.send(response);
        })

    }
    catch (err) {
        res.status(401).send(err);
    }


})

//UPDATE TEST CREATED
router.put('/updateTest/:id', (req, res) => {
    var id = req.params.id;
    var data = req.body;
    console.log(id, data)
    var token = req.headers['authorization'];
    try {
        var decoded = jwt.verify(token, 'shhhh');
        var teach = decoded.teacherid;
        var query = { testName: data.testName };
        //CHECK IF UPDATED TEST NAME ALREADY EXISTS
        Tests.find(query)
            .then(test => {
                console.log(test)
                var cond
                test.map(tes => {

                    cond = tes.teacher == teach
                    console.log(cond)
                })
                if (cond)
                    return res.status(400).json({ test: 'Test Name alreday exists' });
                //IF TEST NAME DOES NOT EXIST THEN CHANGE NAME    
                else {
                    Tests.updateOne({ _id: id }, data, (error, response) => {
                        if (error) {
                            console.log("Err: ", error);
                            res.send(error);
                            return;
                        }
                        console.log(response)
                        res.send("Test Updated");

                    })
                }
            }
            )
    }
    catch (err) {
        res.status(401).send(err);
    }

})
//DELETING TEST

router.delete('/deleteTest/:id', (req, res) => {
    var token = req.headers['authorization'];
    var id = req.params.id;
    try {
        var decoded = jwt.verify(token, 'shhhh');
        Tests.remove({ _id: id })
            .then(resolve => {
                console.log("Delete Succesfully: ", resolve);
                res.send("Test Deleted");
            });
    }
    catch (err) {
        res.status(401).send(err);
    }
})
//GET API FOR SENDING QUESTIONS DATA TO CLIENT
router.get('/readQues', (req, res) => {
    var token = req.headers['authorization'];
    try {
        var decoded = jwt.verify(token, 'shhhh');
        Questions.find((error, response) => {
            if (error) {
                res.status(500);
                res.send(error);
                return
            }
            console.log(response);
            res.send(response);
        })

    }
    catch (err) {
        res.status(401).send(err);
    }


})
module.exports = router;