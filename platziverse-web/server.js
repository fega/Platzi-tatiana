'use strict'

const http= require('http')
const debug= require('debug')('platziverse:web')
const chalk=require('chalk')
const express = require('express')
const socketio = require('socket.io')
const path= require('path')
const asyncify = require('express-asyncify')
const PlatziverseAgent=require('platziverse-agent')
const proxy=require('./proxy')
const {pipe}= require('./utils')
const morgan = require('morgan')
const port= process.env.PORT || 8080
const app=asyncify(express())
const server= http.createServer(app)
const io=socketio(server)
const agent= new PlatziverseAgent()

app.use(express.static(path.join(__dirname,'public')))
app.use(morgan('dev'))
app.use('/', proxy)

// socket io
io.on('connect', socket=>{
    debug(`connected ${socket.id}`)

    pipe(agent,socket)
    
})

// express error handler

app.use((err, req, res, next) => {
    debug(`Error: ${err.message}`)
    debug(err)
    if (err.message.match(/ not found/)) {
        return res.status(404).send({ error: err.message })
    }

    res.status(500).send({ error: err.message })
})

function handleFatalError(err) {
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port,()=>{
    console.log(`${chalk.green('[platziverse-web]')} server listening on port ${port}`)
    agent.connect()
})