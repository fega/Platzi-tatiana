'use strict'

const extend = (obj, value) => {
  return { ...obj, ...value }
}

const metric = {
  id: 1,
  agentId: 1,
  type: 'tata',
  value: '30',
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, {id: 2, type: 'fabi', value: '55'}),
  extend(metric, {id: 3, agentId: 2, value: '70'}),
  extend(metric, {id: 4, agentId: 2, type: 'fabi', value: '65'})
]

module.exports = {
  single: metric,
  all: metrics,
  tata: metrics.filter(a => a.type === 'tata'),
  fabi: metrics.filter(a => a.type === 'fabi'),
  byUuid: uuid => metrics.filter(a => a.uuid === uuid).shift(),
  byId: id => metrics.filter(a => a.id === id).shift(),
  byAgentId: id => metrics.filter(a => a.agentId === id)
}
