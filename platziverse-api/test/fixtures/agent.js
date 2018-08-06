'use strict'
const extend = (obj, value) => {
  return {...obj, ...value}
}

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'tata',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, {id: 2, uuid: 'yyy-yyy-yyw', connected: false, username: 'test'}),
  extend(agent, {id: 3, uuid: 'yry-yyy-yyw'}),
  extend(agent, {id: 4, uuid: 'yry-yyy-yiw', username: 'test'})

]

module.exports = {
  single: agent,
  all: agents,
  tata: agents.filter(a => a.username === 'tata'),
  connected: agents.filter((agent) => agent.connected === true),
  byUuid: uuid => agents.filter(a => a.uuid === uuid).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
