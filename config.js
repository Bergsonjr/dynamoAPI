require('dotenv').config()

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })

module.exports = class Config{
    constructor(){
        this.db = new AWS.DynamoDB();
        this.doc = new AWS.DynamoDB.DocumentClient();
    }
}