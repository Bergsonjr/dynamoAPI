require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express');
const AWS = require('aws-sdk')
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

//Alterar estrutura(refatoração)
//Select table all tables
app.get('/tables', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var dynamodb = new AWS.DynamoDB();
    var params = {}

    dynamodb.listTables(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET(SCAN)
app.get('/clientes', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'clientes',
        FilterExpression: 'cidade = :city',
        ExpressionAttributeValues: {
            ':city': 'Belo Horizonte'
        },
        Limit: 100,
        // ExclusiveStartKey: {nome: '', email: ''} -> para auxiliar em paginação de registros
    };

    documentClient.scan(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET(QUERY)
app.get('/clientes2', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'clientes',
        KeyConditionExpression: 'email = :email and nome = :name',
        ExpressionAttributeValues: {
            ':email': req.query.email,
            ':name': req.query.nome
        }
    };

    documentClient.query(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET(BATCH)
app.get('/clientesBatch', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        RequestItems: {
            'clientes': {
                Keys: [{
                    email: req.query.email,
                    nome: req.query.nome
                }]
            },
            'clientes_loja': {
                Keys: [{
                    email: req.query.email,
                    nome: req.query.nome
                }]
            }
        }
    }

    documentClient.batchGet(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET
app.get('/cliente', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'clientes',
        Key: {
            email: req.query.email,
            nome: req.query.nome
        },
        ConsistentRead: false, // false -> Eventually Consistent(CACHE) | true -> Strongly Consistent(DB)
        ReturnConsumedCapacity: 'TOTAL'
    };

    documentClient.get(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Create - POST(BATCH)
app.post('/clientesBatch', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        RequestItems: {
            'clientes': [{
                PutRequest: {
                    Item: {
                        email: req.body.email,
                        nome: req.body.nome,
                        data_nascimento: req.body.data_nascimento,
                        cidade: req.body.cidade
                    }
                }
            }],
            'clientes_loja': [{
                PutRequest: {
                    Item: {
                        email: req.body.email,
                        nome: req.body.nome
                    }
                }
            }],
        }
    }

    documentClient.batchWrite(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Create - POST
app.post('/cliente', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'clientes',
        Item: {
            email: req.body.email,
            nome: req.body.nome,
            data_nascimento: req.body.data_nascimento,
            cidade: req.body.cidade
        }
    };

    documentClient.put(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Update - PUT
app.put('/cliente', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
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

    documentClient.update(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Delete - DELETE
app.delete('/cliente', (req, res) => {
    AWS.config.update({ region: process.env.REGION })

    var documentClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: 'clientes',
        Key: {
            email: req.body.email,
            nome: req.body.nome,
        },
    };

    documentClient.delete(params, (err, data) => {
        if (!err) {
            res.json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + process.env.PORT);
});