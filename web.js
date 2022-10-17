import Fastify from 'fastify'
import fastifyWs from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import path from 'path'
import url from 'url'

import { createSimulation } from './simulation.js'

const fastify = Fastify({ logger: { transport: { target: 'pino-pretty' } } })

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

fastify
  .register(fastifyWs)
  .register(fastifyStatic, { root: path.join(__dirname, 'public') })

const { start, stop, state } = createSimulation()

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, connection => {
    const sendMessage = payload => {
      connection.socket.send(JSON.stringify(payload))
    }

    connection.socket.on('message', async rawMessage => {
      const message = JSON.parse(rawMessage.toString())

      switch (message.type) {
        case 'start':
          if (state.running) {
            await stop()
          }
          start(+message.philosophersCount)

          state.philosophers.forEach(p =>
            p.on('message', payload => sendMessage(payload))
          )

          break
        case 'stop':
          if (!state.running) {
            return
          }
          await stop()
          break
      }
    })
  })
})

await fastify.listen({ port: 3000 })
