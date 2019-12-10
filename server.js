const bodyParser = require('body-parser');
const AWSconfig = require('./config');
const express = require('express');
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

app.use('/', require('./routes'))

/*app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});*/

//Select - GET(SCAN)
app.get('/clientes', (req, res) => {
    var params = {
        TableName: 'clientes',
        FilterExpression: 'cidade = :city',
        ExpressionAttributeValues: {
            ':city': 'Belo Horizonte'
        },
        Limit: 100,
        // ExclusiveStartKey: {nome: '', email: ''} -> para auxiliar em paginação de registros
    };

    AWSconfig.doc.scan(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET(QUERY)
app.get('/clientes2', (req, res) => {
    var params = {
        TableName: 'clientes',
        KeyConditionExpression: 'email = :email and nome = :name',
        ExpressionAttributeValues: {
            ':email': req.query.email,
            ':name': req.query.nome
        }
    };

    AWSconfig.doc.query(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Select - GET(BATCH)
app.get('/clientesBatch', (req, res) => {
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

    AWSconfig.doc.batchGet(params, (err, data) => {
        if (!err) {
            res.status(200).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

//Create - POST(BATCH)
app.post('/clientesBatch', (req, res) => {
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

    AWSconfig.doc.batchWrite(params, (err, data) => {
        if (!err) {
            res.status(201).json(data)
        } else {
            res.status(500).json(err)
            console.log(err)
        }
    })
});

app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + process.env.PORT);
});