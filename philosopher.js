const { workerData, parentPort } = require('node:worker_threads')
const { setTimeout } = require('timers/promises')

const { philosopherIndex, fork1Index, fork2Index } = workerData

function log(...params) {
  console.log(`philosopher ${philosopherIndex}:`, ...params)
}

function randomDelay() {
  return Math.floor(Math.random() * 600) + 200
}

parentPort.on('message', async forks => {
  const forksView = new Int32Array(forks)

  function waitForFork(index) {
    while (true) {
      Atomics.wait(forksView, index, 1)

      if (Atomics.compareExchange(forksView, index, 0, 1) === 0) {
        break
      }
    }
  }

  function freeForks() {
    Atomics.store(forksView, fork1Index, 0)
    Atomics.store(forksView, fork2Index, 0)
    Atomics.notify(forksView, fork1Index)
    Atomics.notify(forksView, fork2Index)
  }

  while (true) {
    const thinkingTime = randomDelay()
    log(`thinking...`)

    await setTimeout(thinkingTime)

    log('is hungry')

    log('waiting for fork', fork1Index)
    waitForFork(fork1Index)

    await setTimeout(200)

    log('waiting for fork', fork2Index)
    waitForFork(fork2Index)

    const eatingTime = randomDelay()

    log(`eating...`)

    await setTimeout(eatingTime)

    log('finished eating')

    freeForks()
  }
})
