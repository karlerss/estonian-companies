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
            dbConnStr: 'mongodb://mongo:27017/test'
        };

    }

    insertData(db, data, cb = (err, cb) => {}) {
        db.collection('Company').insertMany(data, (err, r) => {
            if (err) console.log(err);
            console.log('Data inserted!');
            cb(err, r);
        });
    };

    dropData(db, cb) {
        db.collection('Company').drop((err, res) => {
            cb(err, res);
        })
    }

    makeIndex(db, cb){
        db.ensureIndex('Company', {name: 'text'}, {name: 'name_text_index'}, function () {
            console.log('Text index created!')
        });
    }

    importCompanies(cb) {
        let me = this;
        mongodb.MongoClient.connect(this.options.dbConnStr, (err, db) => {
            if (err) console.log(err);
            me.dropData(db, () => {
                me.getData(db, (err, data) => {
                    console.log('getData returned')
                });
            });
        });


    };

    getData(db, cb) {
        let me = this;
        let rq = http.get(this.options.csvZipUrl, (res) => {
            let parser = parse(this.options.parserOpts);
            let counter = 1;
            let buffer = [];

            parser.on('readable', () => {
                var record;
                while (record = parser.read()) {
                    buffer.push(record);
                    counter++;
                    if(counter%1000==0){
                        me.insertData(db, buffer);
                        buffer = [];
                    }
                }
            });

            parser.on('error', (err) => {
                cb(err, null);
            });
            parser.on('finish', () => {
                me.makeIndex(db, cb(null, null));
            });

            res.pipe(unzip.Parse()).on('entry', (entry) => {
                entry.pipe(parser);
            });
        })
    };

}
