import Fastify from 'fastify'
import fastifyWs from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import path from 'path'
import url from 'url'

const fastify = Fastify()

import { createSimulation } from './index.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

fastify
  .register(fastifyWs)
  .register(fastifyStatic, { root: path.join(__dirname, 'public') })

const Msg = {
  ALREADY_RUNNING: 'sim::alreadyRunning',
  ALREADY_STOPPED: 'sim::alreadyStopped',
  STOPPED: 'sim::stopped',
  STARTED: 'sim::started',
  UPDATED: 'sim::updated'
}

const { start, stop, state } = createSimulation()

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, connection => {
    const sendMessage = (eventType, payload) => {
      connection.socket.send(JSON.stringify({ type: eventType, payload }))
    }

    connection.socket.on('message', msg => {
      const message = JSON.parse(msg.toString())

      if (message.type === 'start') {
        if (state.running) {
          stop()
        }
        start(message.philosophersCount)

        state.philosophers.forEach(p =>
          p.on('message', payload => {
            sendMessage(Msg.UPDATED, payload)
          })
        )

        console.log('Starting simulation')
        sendMessage(Msg.STARTED)
      }

      if (message.type === 'stop') {
        if (!state.running) {
          return sendMessage(Msg.ALREADY_STOPPED)
        }
        stop()
        console.log('Stopping simulation')
        sendMessage(Msg.STOPPED)
      }
    })
  })
})

try {
  const address = await fastify.listen({ port: 3000 })
  console.log(`Server running on: ${address}`)
} catch (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
