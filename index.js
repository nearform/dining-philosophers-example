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
      .map((_, philosopher, { length }) => {
        const p = new Worker('./philosopher.js', {
          workerData: {
            philosopher,
            // resource hierarchy logic
            fork1: philosopher < length - 1 ? philosopher : 0,
            fork2: philosopher < length - 1 ? philosopher + 1 : philosopher
          }
        })

        p.postMessage(state.forks)

        return p
      })

    state.running = true
  }

  const stop = () => {
    state.philosophers.forEach(p => p.terminate())
    Object.assign(state, {
      forks: undefined,
      philosophers: undefined,
      running: false
    })
  }

  return { stop, start, state }
}
