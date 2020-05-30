const jwt = require('jsonwebtoken');
const Tests = require("../models/Tests");
const Questions = require("../models/Question");

exports.postTestController = (req, res) => {
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
}

exports.getTestController = (req, res) => {
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
}

exports.updateTestController = (req, res) => {
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
                    return res.status(400).json({ test: 'Test Name already exists' });
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

}

exports.deleteTestController = (req, res) => {
    var token = req.headers['authorization'];
    var id = req.params.id;
    try {
        var decoded = jwt.verify(token, 'shhhh');
        console.log(decoded)
        Tests.remove({ _id: id })
            .then(resolve => {
                console.log("Delete Succesfully: ", resolve);
                res.send("Test Deleted");
            });
    }
    catch (err) {
        res.status(401).send(err);
    }
}

const Quest_Per_Page = 5;
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

exports.getQuestionsController = (req, res) => {
    var token = req.headers['authorization'];
    const page = +req.params.page || 1;
    const course=req.query.course;
    const type=req.query.type;
    const search=req.query.search;
    let match={};
    let query={};
   
    course.length>0 ?match={course}:match={};
    type.length>0?query={type}:query={};
    const skip = (page - 1) * Quest_Per_Page;
    const limit = Quest_Per_Page;
    let totalQuestions;
    try {
        var decoded = jwt.verify(token, 'shhhh');
        Questions.find().countDocuments().then(numQues => {
            totalQuestions = numQues;
            console.log(totalQuestions)
            return Questions.find(query).populate({
                path: 'test',
                model: 'Tests',
                match: match
            })
                .exec(function (err, ques) {

                    ques = ques.filter(function (ques) {

                        return ques.test; // return only questions with test matching 'testName: "test1"' query
                    }).filter(qu=>{
                        return qu.question.indexOf(search)!=-1
                    })

                    
                    totalQuestions = ques.length
                    if (err) return handleError(err);
                    res.send({
                        ques: ques.slice(skip, limit + skip),
                        currentPage: page,
                        ques_per_page: Quest_Per_Page,
                        hasNextPage: page * Quest_Per_Page < totalQuestions,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        hasPreviousPage: page > 1,
                        lastPage: Math.ceil(totalQuestions / Quest_Per_Page)
                    });
                }) 
        })


    }
    catch (err) {
        res.status(401).send(err);
    }
}

exports.postQuestionController = (req, res) => {
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
                    return res.status(400).json({ ques: 'Question already exists' });
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
}

exports.deleteQuestionController = (req, res) => {
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
}

exports.updateQuestionController = (req, res) => {
    var id = req.params.id;
    var data = req.body;
    console.log(id, data)
    var token = req.headers['authorization'];
    try {
        var decoded = jwt.verify(token, 'shhhh');
        var test = data.test;
        var query = { question: data.question };
        //CHECK IF UPDATED TEST NAME ALREADY EXISTS
        Questions.find(query)
            .then(ques => {
                console.log(ques)
                var cond
                ques.map(qu => {

                    cond = qu.test == test
                    console.log(cond)
                })
                if (cond)
                    return res.status(400).json({ question: 'Question already exists' });
                //IF QUESTION NAME DOES NOT EXIST THEN CHANGE NAME    
                else {
                    Questions.updateOne({ _id: id }, data, (error, response) => {
                        if (error) {
                            console.log("Err: ", error);
                            res.send(error);
                            return;
                        }
                        console.log(response)
                        res.send("Question Updated");

                    })
                }
            }
            )
    }
    catch (err) {
        res.status(401).send(err);
    }

}