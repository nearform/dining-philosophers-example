import { Worker } from 'node:worker_threads'

export const createSimulation = () => {
  const state = {
    forks: undefined,
    philosophers: undefined,
    running: false
  }

  const start = (numberOfPhilosophers = 5) => {
    const num = +numberOfPhilosophers
    const buffer = new SharedArrayBuffer(num * Int32Array.BYTES_PER_ELEMENT)

    state.forks = new Int32Array(buffer)

    state.philosophers = Array(num)
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

    state.philosophers.forEach(p => p.postMessage(state.forks))
    state.running = true
  }

  const stop = () => {
    state.philosophers.forEach(p => p.terminate())
    state.forks = undefined
    state.philosophers = undefined
    state.running = false
  }

  return { stop, start, state }
}
