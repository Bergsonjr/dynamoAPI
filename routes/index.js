const Router = require('express').Router()

Router.use('/', require('./tables'))
Router.use('/', require('./client'))

module.exports = Router