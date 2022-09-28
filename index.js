import { Worker } from 'node:worker_threads'
import Fastify from 'fastify'
import fastifyWs from '@fastify/websocket'

const numberOfPhilosophers = 5

const buffer = new SharedArrayBuffer(
  numberOfPhilosophers * Int32Array.BYTES_PER_ELEMENT
)

const forks = new Int32Array(buffer)

const philosophers = Array(numberOfPhilosophers)
  .fill(null)
  .map(
    (_, philosopher, { length }) =>
      new Worker('./philosopher.js', {
        workerData: {
          philosopher,
          // resource hierarchy logic
          fork1: philosopher < length - 1 ? philosopher : 0,
          fork2: philosopher < length - 1 ? philosopher + 1 : philosopher
        }
      })
  )

philosophers.forEach(p => p.postMessage(forks))

const fastify = Fastify()

fastify.register(fastifyWs)

fastify.register(async function (fastify) {
  fastify.get('/', { websocket: true }, connection => {
    philosophers.forEach(p =>
      p.on('message', workerMessage => {
        connection.socket.send(JSON.stringify(workerMessage))
      })
    )
  })
})

fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
