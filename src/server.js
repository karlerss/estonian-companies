'use strict';

//var Ariregister = require('./ariregister.js');

import Ariregister from './Ariregister';
import express from 'express';
import mongodb from 'mongodb';

var ar = new Ariregister();
var app = express();
var db;

mongodb.MongoClient.connect("mongodb://localhost:27017/test", function (err, database) {
    if (err) throw err;
    db = database;
    app.listen(3002);
    console.log("Listening on port 3000");
});

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/company', function (req, res) {
    var query = req.param('q');

    db.collection('Company').find({
        "$text": {
            "$search": query
        }
    }, {limit: 20}).toArray((err, resp) => {
        console.log(err, resp);
        res.json(resp)
    });

});

// update every week
setInterval(function () {

    // create new instance to reopen db connections
    var ar = new Ariregister();
    ar.importCompanies(() => {
        console.log('File downloaded');
    });
}, 604800000);
