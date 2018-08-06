const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
    name: "myapp",
    username: "tatianarodrig",
    interval: 2000
})

agent.addMetric('rss', function getRss() {
    return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise() {
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback(callback) {
    setTimeout(() => {
        callback(null, Math.random())
    }, 1000)
})

agent.connect()


//estos eventos son UNICAMENTE del agente que esta conectado
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)


// estos los emito para aquellos que no son mis mensajes
agent.on('agent/disconnected', handler)
agent.on('agent/connected', handler)
agent.on('agent/message', payload => {
    console.log(payload)
})

function handler(payload) {
    console.log(payload)
}

// setTimeout(() => agent.disconnect(), 10000)