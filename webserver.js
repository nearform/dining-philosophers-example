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
  // TODO: fix / not redirecting to /index.html
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
  fastify.get('/', { websocket: true }, connection => {
    const sendMessage = (eventType, payload) => {
      connection.socket.send(JSON.stringify({ type: eventType, payload }))
    }

    connection.socket.on('message', msg => {
      const message = msg.toString()
      if (message === 'start') {
        if (state.running) {
          stop()
        }

        start()
        sendMessage(Msg.INIT, { philosophers: state.philosophers })

        state.philosophers.forEach(p =>
          p.on('message', payload => {
            sendMessage(Msg.UPDATED, payload)
          })
        )
        sendMessage(Msg.STARTED)
      }

      if (message === 'stop') {
        if (!state.running) {
          return sendMessage(Msg.ALREADY_STOPPED)
        }
        stop()
        sendMessage(Msg.STOPPED)
      }
    })
  })
})

try {
  await fastify.listen({ port: 3000 })
  console.log('Listening on port 3000')
} catch (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
