import { workerData, parentPort } from 'node:worker_threads'
import { setTimeout } from 'node:timers/promises'

const { philosopher, fork1, fork2 } = workerData

function log(...params) {
  console.log(`philosopher ${philosopher}:`, ...params)
}

function randomDelay() {
  return Math.floor(Math.random() * 6000) + 200
}

parentPort.on('message', async forks => {
  function waitForFork(index) {
    while (true) {
      Atomics.wait(forks, index, 1)

      if (Atomics.compareExchange(forks, index, 0, 1) === 0) {
        break
      }
    }
  }

  function freeForks() {
    Atomics.store(forks, fork1, 0)
    Atomics.store(forks, fork2, 0)
    Atomics.notify(forks, fork1)
    Atomics.notify(forks, fork2)
  }

  while (true) {
    const thinkingTime = randomDelay()
    log(`thinking...`)

    await setTimeout(thinkingTime)

    log('is hungry')

    log('waiting for fork', fork1)
    waitForFork(fork1)

    await setTimeout(200)

    log('waiting for fork', fork2)
    waitForFork(fork2)

    const eatingTime = randomDelay()

    log(`eating...`)

    await setTimeout(eatingTime)

    log('finished eating')

    freeForks()
  }
})
