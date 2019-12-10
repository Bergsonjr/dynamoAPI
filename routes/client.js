const Client = require('express').Router()
const AWSconfig = require('../config')
const documentClient = new AWSconfig()

//Select - GET
Client.get('/cliente', (req, res) => {
    var params = {
        TableName: 'clientes',
        Key: {
            email: req.query.email,
            nome: req.query.nome
        },
        ConsistentRead: false, // false -> Eventually Consistent(CACHE) | true -> Strongly Consistent(DB)
        ReturnConsumedCapacity: 'TOTAL'
    };

    documentClient.doc.get(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Create - POST
Client.post('/cliente', (req, res) => {
    var params = {
        TableName: 'clientes',
        Item: {
            email: req.body.email,
            nome: req.body.nome,
            data_nascimento: req.body.data_nascimento,
            cidade: req.body.cidade
        }
    };

    documentClient.doc.put(params, (err, data) => {
        if (!err) {
            res.status(201).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Update - PUT
Client.put('/cliente', (req, res) => {
    var params = {
        TableName: 'clientes',
        Key: {
            email: req.body.email,
            nome: req.body.nome,
        },
        UpdateExpression: 'set #d = :y',
        ExpressionAttributeNames: {
            '#d': 'data_nascimento',
            '#d': 'cidade'
        },
        ExpressionAttributeValues: {
            ':y': req.body.data_nascimento,
            ':y': req.body.cidade
        },
    };

    documentClient.doc.update(params, (err, data) => {
        if (!err) {
            res.status(204).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Delete - DELETE
Client.delete('/cliente', (req, res) => {
    var params = {
        TableName: 'clientes',
        Key: {
            email: req.body.email,
            nome: req.body.nome,
        },
    };

    documentClient.doc.delete(params, (err, data) => {
        if (!err) {
            res.status(204).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

module.exports = Client