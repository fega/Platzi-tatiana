'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null

let connectedArgs = {
  where: { connected: true }
}

let usernameArgs = {
  where: {username: 'tata', connected: true}
}

let uuidArgs = {
  where: {
    uuid
  }
}

let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.tata))
  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  // uuidArgs debe ser un objeto igual al que pasamos como condicion en agent/lib (agent.uuid)

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
  sandbox && sandbox.restore()
  //  if (sandbox) sinon.sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was not executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub))
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was not executed')
})

test.serial('AgentFindByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified uuid')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

test.serial('AgentFindConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called without arguments')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same length')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('AgentFindAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without arguments')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same length')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('AgentFindByUsername', async t => {
  let agents = await db.Agent.findByUsername('tata')

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username arguments')

  t.is(agents.length, agentFixtures.tata.length, 'agents should be the same length')
  t.deepEqual(agents, agentFixtures.tata, 'agents should be the same')
})

test.serial('AgentFindById', async t => {
  let agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'the function findById was not called on the model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same agent')
})

test.serial('AgentCreateOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, ' findOne was no executed')
  t.true(AgentStub.findOne.calledTwice, 'findOne shoud be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'agent should be equal to single')
})

test.serial('AgentCreateOrUpdate - new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, ' findOne was no executed')
  t.true(AgentStub.findOne.calledOnce, 'findOne shoud be called once')
  t.true(AgentStub.findOne.calledWith({
    where: {uuid: newAgent.uuid}
  }), 'findOne should be called with uuid args')
  t.true(AgentStub.create.called, 'crete should be called on the model')
  t.true(AgentStub.create.calledOnce, 'update should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with newAgent args')

  t.deepEqual(agent, newAgent, 'agent should be equal to newAgent')
})
