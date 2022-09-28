import { workerData, parentPort } from 'node:worker_threads'
import { setTimeout as sleep } from 'node:timers/promises'

const { philosopher, fork1, fork2 } = workerData

function log(...params) {
  console.log(`philosopher ${philosopher}:`, ...params)
}

function randomDelay() {
  return Math.floor(Math.random() * 600) + 500
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

  const UpdateTypes = {
    thinking: 'thinking',
    eating: 'eating',
    waitingFork: fork => `waitingFork::${fork}`
  }

  while (true) {
    const thinkingTime = randomDelay()
    log(`thinking...`)

    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.thinking
    })

    await sleep(thinkingTime)
    log('is hungry')

    log('waiting for fork', fork1)
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.waitingFork(fork1)
    })

    waitForFork(fork1)

    await sleep(200)

    log('waiting for fork', fork2)
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.waitingFork(fork2)
    })
    waitForFork(fork2)

    const eatingTime = randomDelay()
    log(`eating...`)
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.eating
    })
    await sleep(eatingTime)
    log('finished eating')

    freeForks()
  }
})
