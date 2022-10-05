import { workerData, parentPort } from 'node:worker_threads'
import { setTimeout as sleep } from 'node:timers/promises'

const { philosopher, fork1, fork2 } = workerData

function log(...params) {
  console.log(`philosopher ${philosopher}:`, ...params)
}

function randomDelay() {
  const BASE_DELAY_DURATION = 1000
  const VARIABLE_DELAY_DURATION_MULTIPLIER = 1200
  return (
    Math.floor(Math.random() * VARIABLE_DELAY_DURATION_MULTIPLIER) +
    BASE_DELAY_DURATION
  )
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
    hungry: 'hungry',
    eating: 'eating',
    grabbingFork: `grabbingFork`,
    freeingForks: `freeingForks`
  }

  while (true) {
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.thinking
    })
    const thinkingTime = randomDelay()
    log(`thinking...`)

    await sleep(thinkingTime)

    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.hungry
    })
    log('is hungry')

    log('waiting for fork', fork1)
    waitForFork(fork1)
    log('got fork', fork1)
    await sleep(800)
    parentPort.postMessage({
      philosopher,
      fork: fork1,
      updateType: UpdateTypes.grabbingFork
    })

    log('waiting for fork', fork2)
    waitForFork(fork2)
    log('got fork', fork2)
    parentPort.postMessage({
      philosopher,
      fork: fork2,
      updateType: UpdateTypes.grabbingFork
    })

    log(`eating...`)
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.eating
    })

    const eatingTime = randomDelay()
    await sleep(eatingTime)

    log(`finished eating, freeing forks: ${fork1} ${fork2}`)
    freeForks()
    parentPort.postMessage({
      philosopher,
      updateType: UpdateTypes.freeingForks
    })
  }
})
