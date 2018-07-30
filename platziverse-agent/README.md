#platziverse-agent

##Usage

```js
const PlatziverseAgent=require ('platziverse-agent')

const agent = new PlatziverseAgent({
    interval:2000
})

agent.connect()


//This agent only
agent.on('connected')
agent.on('disconnected')
aget.on('message')


// estos los emito para aquellos que no son mis mensajes
agent.on('agent/disconnected')
agent.on('agent/connected')
agent.on('agent/message',payload=>{
    console.log(payload)
})

setTimeout(()=> agent.disconnect(), 20000)
```