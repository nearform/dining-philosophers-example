import { workerData, parentPort } from 'node:worker_threads'
import { setTimeout as sleep } from 'node:timers/promises'

import { UpdateType } from './public/constants.js'

const { philosopher, fork1, fork2 } = workerData

function randomDelay() {
  const BASE_DELAY = 1000
  const DELAY_MULTIPLIER = 1200

  return Math.floor(Math.random() * DELAY_MULTIPLIER) + BASE_DELAY
}

parentPort.on('message', async forks => {
  function tryGetFork(index) {
    if (Atomics.compareExchange(forks, index, 0, 1) === 0) {
      return
    }

    Atomics.wait(forks, index, 1)
    tryGetFork(index)
  }

  function freeForks() {
    Atomics.store(forks, fork1, 0)
    Atomics.store(forks, fork2, 0)
    Atomics.notify(forks, fork1)
    Atomics.notify(forks, fork2)
  }

  while (true) {
    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.thinking
    })
    const thinkingTime = randomDelay()

    await sleep(thinkingTime)

    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.hungry
    })

    tryGetFork(fork1)

    await sleep(800)

    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.grabbingFork,
      fork: fork1
    })

    tryGetFork(fork2)

    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.grabbingFork,
      fork: fork2
    })

    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.eating
    })

    const eatingTime = randomDelay()
    await sleep(eatingTime)

    freeForks()

    parentPort.postMessage({
      philosopher,
      updateType: UpdateType.freeingForks,
      forks: { fork1, fork2 }
    })
  }
})
