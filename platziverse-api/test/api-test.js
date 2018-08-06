'use strict'

const test = require('ava')
const request = require('supertest')
const proxyquire = require('proxyquire')
const util = require('util')
const config = require('../config')
const sinon= require('sinon')
const agentFixtures= require('./fixtures/agent')
const auth= require('../auth')
const sign = util.promisify(auth.sign)


let sandbox= null
let server = null
let dbStub= null
let token=null
let AgentStub={}
let MetricStub={}

test.beforeEach(async()=>{
    sandbox=sinon.createSandbox()

    dbStub=sandbox.stub()

    dbStub.returns(Promise.resolve({
        Agent: AgentStub,
        Metric: MetricStub
    }))

    AgentStub.findConnected = sandbox.stub()
    AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))

    token=await sign({admin:true, username:'tata'}, config.auth.secret)
    const api= proxyquire('../api',{
        'platziverse-db':dbStub
    })

    server=proxyquire('../server',{
        './api':api
    })
})

test.afterEach(()=>{
    sandbox && sandbox.restore()
})


test.serial.cb('/api/agents', t =>{
    request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err,res)=>{
        t.falsy(err,'should no return an error')
        let body = JSON.stringify(res.body)
        let expected=JSON.stringify(agentFixtures.connected)
        t.deepEqual(body,expected, ' response body should be the expected')
        t.end()
    })
})