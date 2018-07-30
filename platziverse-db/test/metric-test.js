'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const metricFixtures = require('./fixtures/metric')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () { }
}

let db = null
let MetricStub = null
let sandbox = null
let AgentStub = null
let metricByUuid = null
let uuid = 'yyy-yyy-yyy'

let newMetric = {
  agentId: 1,
  type: 'fabi',
  value: '55'
}

let uuidArgs = {
  where: {uuid}
}
let metricArgs = {
  type: 'fabi',
  value: '55'
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  MetricStub = {
    belongsTo: sinon.spy()
  }
  metricByUuid = ({
    attributes: ['type'],
    group: ['type'],
    include: [{
      attributes: [],
      model: AgentStub,
      where: { uuid }
    }],
    raw: true
  })

  // Model create Stub

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  // Model FindAll Stub

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(metricByUuid).returns(Promise.resolve(metricFixtures.byAgentId(1)))
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

// serial

test.serial('createMetric, agent doesnt exist', async t => {
  let metric = await db.Metric.create('fake-an-unexistant-uuid', metricArgs)

  t.falsy(metric)
})
test.serial('createMetric, agent exist', async t => {
  let metric = await db.Metric.create(uuid, metricArgs)

  t.truthy(metric)
  t.is(metric.agentId, 1)
  t.is(metric.value, '55')
})

test.serial('findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)

  t.truthy(metric)
  console.log(metricByUuid)
  t.deepEqual(metric, metricFixtures.byAgentId(1), 'should be the same')
})
