import { Status, UpdateType, SERVER_URL } from './constants.js'
import { createForks } from './createForks.js'
import { createPlates } from './createPlates.js'
import { createTable } from './createTable.js'
import { createChairs } from './createChairs.js'

const defaultState = (count = 5) => ({
  philosophers: new Array(count).fill(Status.thinking),
  forks: new Array(count).fill(-1)
})

const state = defaultState()

const updateView = () => {
  createTable({ state })
  createForks({ state })
  createChairs({ state })
  createPlates({ state })
}

const main = async () => {
  const socket = new WebSocket(SERVER_URL)
  const queue = []

  const resetState = count => {
    state.philosophers = defaultState(count).philosophers
    state.forks = defaultState(count).forks
    queue.length = 0
    updateView(state)
  }

  document.querySelector('#start-button').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'start' }))
    resetState()
  })

  document.querySelector('#stop-button').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'stop' }))
    resetState()
  })

  socket.onmessage = event => {
    queue.push(event)
  }

  const parse = event => {
    const message = JSON.parse(event.data)

    const { philosopher, fork, updateType } = message.payload || {}

    if (!updateType) {
      return
    }

    switch (updateType) {
      case UpdateType.thinking:
        state.philosophers[philosopher] = Status.thinking
        break
      case UpdateType.hungry:
        state.philosophers[philosopher] = Status.hungry
        break
      case UpdateType.eating:
        state.philosophers[philosopher] = Status.eating
        break
      case UpdateType.freeingForks:
        for (const [idx, fork] of state.forks.entries()) {
          if (fork === philosopher) {
            state.forks[idx] = -1
          }
        }
        state.philosophers[philosopher] = Status.thinking
        break
      case UpdateType.grabbingFork:
        state.forks[fork] = philosopher
        if (state.forks.filter(p => p === philosopher).length === 2) {
          state.philosophers[philosopher] = Status.eating
        }
        break
      default:
        console.error('Invalid update type', updateType)
    }

    updateView(state)
  }

  const sleep = interval => new Promise(r => setTimeout(r, interval))

  while (true) {
    const event = queue.shift()

    if (state.paused) {
      await sleep(100)
      return
    }

    if (event) {
      parse(event)

      await sleep(200)
    } else {
      await sleep(100)
    }
  }
}

main()
