const jwt = require('jsonwebtoken');
const Tests = require("../models/Tests");
const Questions = require("../models/Question");
const Groups = require("../models/Groups");
const StudentsInGroup = require("../models/Students_In_Group");
const GroupsAssignedTests=require("../models/Groups_Assigned_Test")
const Students = require("../models/Students");
const Results=require('../models/Results')
const is_Empty = require('../is_Empty');
let _ = require('lodash')
const mongoose = require('mongoose');
const keys=require('../config/keys')

//groupTest
exports.groupTestController=(req,res)=>{
    const token=req.headers["authorization"];
    const id=req.params.id
    try{
        const decoded=jwt.verify(token,keys.secret)
        const group=StudentsInGroup.find({studentId:id})
        .select('-studentId -_id')
        .populate('groupId',' groupName ')
         .exec()
         .then(group=>{
             return tests(group)
           
         })
        
    }
    catch(err){
        return res.status(401).send(err);
    }
}
exports.studentTestController=(req,res)=>{
    const token=req.headers["authorization"];
    const id=req.params.id
    try{
        const decoded=jwt.verify(token,keys.secret)
       StudentsInGroup.find({studentId:id})
        .distinct('groupId')
        .then(grp=>{
            return tests(grp) 
        }

        )
        
         .catch(err=>{
            return res.send('Something went wrong')
         })
         
        function tests(group){
            

           const query={
               'groupId':{$in:group}
           }
           
            GroupsAssignedTests.find(query)
            .select('-_id')
            .populate('testId groupId','testName groupName')
            .exec()
            .then(test=>{
                let arr=[]
                test.map(tes=>{
                    
                    var arr2=arr.filter((v,i)=>{
                       
                      return  tes.groupId.groupName==v.groupId.groupName
                    })
                    if(arr2.length){
                       var arr2Index=arr.indexOf(arr2[0])
                    //    output[existingIndex].value = output[existingIndex].value.concat(item.value);
                 
                    //    arr[arr2Index].testId=arr[arr2Index].testId.testName.concat(tes.testId.testName)
                       arr[arr2Index].testId=arr[arr2Index].testId.concat(tes.testId)
                    //   console.log(arr2)
                    //   console.log(arr)
                    }
                    else {
                       
                        if (typeof tes.testId == 'object')
                          tes.testId = [tes.testId];
                        arr.push(tes);
                      }
                })
                console.log(arr)
                
         return res.send(arr)
            }
            )
       
       }
    }
    catch(err){
        return res.status(401).send(err);
    }
}
exports.fetchQuestionsController=(req,res)=>{
    const token=req.headers['authorization']
    const testId=req.params.testId
    try{
        const decoded=jwt.verify(token,keys.secret)
        Questions.find({test:testId})
        .then(ques=>{
            console.log(ques)
            return res.send(ques)
        }
        )
    }
    catch(err){

    }
}
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
exports.postResultsController=(req,res)=>{
  
    const token=req.headers['authorization']
   const data=req.body
    try{
        const decoded=jwt.verify(token,keys.secret)
        console.log(decoded)
        console.log(req.body)
        d = formatAMPM(new Date);
        data = { ...data, created_at: d }
    }
    catch(err){

    }
}