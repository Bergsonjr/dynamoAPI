const Tables = require('express').Router()
const AWSconfig = require('../config');
const documentClient = new AWSconfig()

//Select table all tables
Tables.get('/tables', (req, res) => {
    var params = {}
    documentClient.db.listTables(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

module.exports = Tables