// server.js or your route file
const express = require('express');
const app = express();
const cloudinary = require('cloudinary');
const catchAsyncError = require('../middleware/catchAsyncError');
const Visit = require('../models/Visit');
const User = require('../models/User');

app.use(express.json({ limit: '10mb' }));

exports.uploadSelfie = catchAsyncError(async (req, res) => {
    const { imageBase64, dateTime } = req.body;

    if (req.user.role !== "practitioner") {
        return res
            .status(403)
            .json({ message: "Access denied. Practitioner only." });
    }
    if (!imageBase64) {
        return res.status(400).json({ error: 'No image data provided' });
    }

    const result = await cloudinary.v2.uploader.upload(imageBase64, {
        folder: 'selfies'
    });

    const practitioner = await User.findById(req.user.id);
    const client = await User.findById(practitioner.assignedId)
    if (practitioner.visitId.length<=0) {
        const visit = new Visit({
            clientId: practitioner.assignedId,
            practitionerId: practitioner._id,
            checkIn: {
                photo: result.secure_url,
                time: dateTime
            }
        })
        await visit.save()
        practitioner.visitId = visit._id
        client.visitId.push(visit._id)
        await client.save()
        await practitioner.save()
    }
    else {
        const visit = await Visit.findById(practitioner.visitId);        
        visit.checkOut.photo=result.secure_url
        visit.checkOut.time=dateTime
        practitioner.visitId=[]
        await visit.save()
        await practitioner.save()
    }

    res.json({ url: result.secure_url });

});

exports.uploadReport = catchAsyncError(async (req, res) => {
    const {report} = req.body;

    if (req.user.role !== "practitioner") {
        return res
            .status(403)
            .json({ message: "Access denied. Practitioner only." });
    }
    if (!report) {
        return res.status(400).json({ error: 'No report provided' });
    }
    const practitioner = await User.findById(req.user.id);
    const visit = await Visit.findById(practitioner.visitId[0]);

    const upload = report.imgUrl.map(async(i)=>{   
        
        
        const result = await cloudinary.v2.uploader.upload(i, {
            folder: 'report'
        });
        return{"imgUrl":result.secure_url}
    })

    const urls = await Promise.all(upload);
            
    visit.report.bloodPressure=report.bloodPressure;
    visit.report.sugar=report.sugar
    visit.report.notes=report.notes
    visit.report.prescription_images = urls

    await visit.save()

    res.json({message:"saved" });

});