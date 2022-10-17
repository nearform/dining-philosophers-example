import { Worker } from 'node:worker_threads'

export const createSimulation = () => {
  const state = {
    forks: undefined,
    philosophers: undefined,
    running: false
  }

  const start = numberOfPhilosophers => {
    const buffer = new SharedArrayBuffer(
      numberOfPhilosophers * Int32Array.BYTES_PER_ELEMENT
    )

    state.forks = new Int32Array(buffer)

    state.philosophers = Array(numberOfPhilosophers)
      .fill(null)
      .map((_, philosopher, { length }) => {
        const w = new Worker('./philosopher.js', {
          workerData: {
            philosopher,
            // resource hierarchy logic
            fork1: philosopher < length - 1 ? philosopher : 0,
            fork2: philosopher < length - 1 ? philosopher + 1 : philosopher
          }
        })

        w.postMessage(state.forks)

        return w
      })

    state.running = true
  }

  const stop = async () => {
    await Promise.all(state.philosophers.map(w => w.terminate()))

    Object.assign(state, {
      forks: undefined,
      philosophers: undefined,
      running: false
    })
  }

  return { stop, start, state }
}
