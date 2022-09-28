import Fastify from 'fastify'
import fastifyWs from '@fastify/websocket'
const fastify = Fastify()

import { philosophers } from './index.js'

fastify.register(fastifyWs)

fastify.register(async function (fastify) {
  fastify.get('/', { websocket: true }, connection => {
    connection.socket.on('')
    philosophers.forEach(p =>
      p.on('message', workerMessage => {
        connection.socket.send(JSON.stringify(workerMessage))
      })
    )
  })
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
