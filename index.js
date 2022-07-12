require('dotenv').config()

const express = require('express');
const multer = require("multer")
const cors = require('cors');
const app = express();

const port = process.env.PORT;
const BASE_URL = process.env.BASE_URL

const JSONdb = require('simple-json-db')
const db = new JSONdb('./db.json')

const upload = multer({dest: 'uploads/'})

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.post(BASE_URL + "/points/", upload.single('img'), (req, res) => {
    let dbMarkers = db.get("points")
    if (dbMarkers == null || dbMarkers == undefined || dbMarkers.length == 0) dbMarkers = []
    let newMarker = {"id" : dbMarkers.length,  "lat": req.body.lat, "lng": req.body.lng, "date": req.body.date, "notes": req.body.notes, "filename": req.file.filename, "tag": req.body.categorie}
    dbMarkers.push(newMarker)

    db.set("points", dbMarkers)
    console.log(newMarker)
    return res.status(201).json({"message" : "201 worked"})
})

app.get(BASE_URL + "/points/", (req, res) => {
    let dbMarkers = db.get("points")
    console.log(dbMarkers)
    res.status(200).json(dbMarkers)
})

app.get(BASE_URL + "/image/:file", (req, res) => {
    let filename = req.params.file
    let location = '/uploads/' + filename
    res.sendFile(process.env.LOCATION_BACKEND + location)
})

app.get(BASE_URL + "/tags/", (req, res) => {
    let dbMarkers= db.get("points")
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