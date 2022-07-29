require('dotenv').config()

const AWS = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT;
const BASE_URL = process.env.BASE_URL

const JSONdb = require('simple-json-db')
const db = new JSONdb('./db.json')

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET_NAME,
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
          cb(null, Date.now().toString())
        }
    })
})


app.post(BASE_URL + "/points/", uploadS3.single("img"), (req, res) => {
    let dbMarkers = db.get("points")    
    console.log(req.file)

    if (dbMarkers == null || dbMarkers == undefined || dbMarkers.length == 0) dbMarkers = []
    let newMarker = {"id" : dbMarkers.length,  "lat": req.body.lat, "lng": req.body.lng, "date": req.body.date, "notes": req.body.notes, "filename": req.file.originalname, "tag": req.body.categorie, "link": req.file.location }
    dbMarkers.push(newMarker)

    db.set("points", dbMarkers)
    return res.status(201).json({"message" : "201 worked"})
})

app.get(BASE_URL + "/points/", (req, res) => {
    let dbMarkers = db.get("points")
    console.log(dbMarkers)
    res.status(200).json(dbMarkers)
})

app.get(BASE_URL + "/tags/", (req, res) => {
    let dbMarkers= db.get("points")
    if (dbMarkers == null || dbMarkers == undefined || dbMarkers.length == 0) dbMarkers = []
    let tags = []
    for(i = 0; i < dbMarkers.length; i++) {
        if (!tags.includes(dbMarkers[i].tag)) {
            tags.push(dbMarkers[i].tag)
        }
    }
    res.status(200).json(tags)
})


app.listen(port, () => {
    console.log('App listening on port + ' + port);
});