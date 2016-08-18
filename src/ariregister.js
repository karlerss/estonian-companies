'use strict';

import fs from 'fs';
import http from 'http';
import parse from 'csv-parse';
import unzip from 'unzip';
import mongodb from 'mongodb';


export default class Ariregister {
    constructor() {
        this.options = {
            parserOpts: {
                delimiter: ';',
                columns: ['name', 'regCode', 'taxCode', 'status', 'statusText', 'address', 'location', 'locationCode',
                    'locationEhak', 'postalCode', 'adsAdrId', 'adsAdsOid', 'adsNormalAddress', 'link']
            },
            csvZipUrl: 'http://avaandmed.rik.ee/andmed/ARIREGISTER/ariregister_csv.zip',
            dbConnStr: 'mongodb://localhost:27017/test'
        };

    }

    insertData(db, data, cb) {
        db.collection('Company').insertMany(data, (err, r) => {
            if (err) console.log(err);
            db.ensureIndex('Company', {name: 'text'}, {name: 'name_text_index'}, function () {
                db.close();
            });
            console.log('OK2');
            cb(err, r);
        });
    };

    dropData(db, cb) {
        db.collection('Company').drop((err, res) => {
            cb(err, res);
        })
    }

    importCompanies(cb) {
        let me = this;
        mongodb.MongoClient.connect(this.options.dbConnStr, (err, db) => {
            if (err) console.log(err);
            me.dropData(db, () => {
                me.getData((err, data) => {
                    if (err) console.log(err);
                    me.insertData(db, data, cb);
                });
            });
        });



    };

    getData(cb) {
        let rq = http.get(this.options.csvZipUrl, (res) => {
            let parser = parse(this.options.parserOpts);
            let output = [];

            parser.on('readable', () => {
                var record;
                while (record = parser.read()) {
                    output.push(record);
                }
            });

            parser.on('error', (err) => {
                cb(err, null);
            });
            parser.on('finish', () => {
                cb(null, output);
            });

            res.pipe(unzip.Parse()).on('entry', (entry) => {
                entry.pipe(parser);
            });
        })
    };

}
