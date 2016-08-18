'use strict';

//var Ariregister = require('./ariregister.js');

import Ariregister from './ariregister';
import express from 'express';
import mongodb from 'mongodb';
import util from 'util';
import process from 'process';

var ar = new Ariregister();
var app = express();
var db;

setInterval(() => {
    console.log(util.inspect(process.memoryUsage()));
}, 1000);

mongodb.MongoClient.connect("mongodb://mongo:27017/test", function (err, database) {
    if (err) throw err;
    db = database;
    app.listen(3002);
    console.log("Listening on port 3002");
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
        res.json(resp)
    });

});

ar.importCompanies(() => {
    console.log('File downloaded');
});

// update every week
setInterval(function () {

    // create new instance to reopen db connections
    var ar = new Ariregister();
    ar.importCompanies(() => {
        console.log('File downloaded');
    });
}, 604800000);
