import { Worker } from 'node:worker_threads'

const numberOfPhilosophers = 5

const forks = new SharedArrayBuffer(
  numberOfPhilosophers * Int32Array.BYTES_PER_ELEMENT
)

const philosophers = Array(numberOfPhilosophers)
  .fill(null)
  .map(
    (_, philosopherIndex, { length }) =>
      new Worker('./philosopher.js', {
        workerData: {
          philosopherIndex,
          // resource hierarchy logic
          fork1Index: philosopherIndex < length - 1 ? philosopherIndex : 0,
          fork2Index:
            philosopherIndex < length - 1
              ? philosopherIndex + 1
              : philosopherIndex
        }
      })
  )

philosophers.forEach(p => p.postMessage(forks))
