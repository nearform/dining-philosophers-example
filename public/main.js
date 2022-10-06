import { Status, UpdateType, SERVER_URL } from './constants.js'
import { createForks } from './createForks.js'
import { createPlates } from './createPlates.js'
import { createTable } from './createTable.js'
import { createChairs } from './createChairs.js'

const defaultState = (count = 5) => ({
  paused: false,
  philosophers: new Array(count).fill(Status.thinking),
  forks: new Array(count).fill(-1),
  queue: []
})

const state = defaultState()

const updateView = () => {
  createTable({ state })
  createForks({ state })
  createChairs({ state })
  createPlates({ state })
}

const resetState = () => {
  const count = +el.philosophersCountInput.value
  Object.assign(state, defaultState(count))
  updateView()
}

const el = {
  pauseButton: document.querySelector('#pause-button'),
  startButton: document.querySelector('#start-button'),
  stopButton: document.querySelector('#stop-button'),
  philosophersCountInput: document.querySelector('#philosophers-count')
}

const validateInput = () => {
  const count = +el.philosophersCountInput.value

  if (isNaN(count) || count < 3 || count > 8) {
    alert('Philosophers count must be a number betwen 3 and 8')
    el.philosophersCountInput.value = 5
    return false
  }

  return true
}

const addEventListeners = socket => {
  el.philosophersCountInput.addEventListener('change', () => {
    validateInput()
    resetState()
  })

  el.pauseButton.addEventListener('click', () => {
    state.paused = !state.paused
    el.pauseButton.textContent = state.paused ? 'Resume' : 'Paused'
  })

  el.startButton.addEventListener('click', () => {
    const count = +el.philosophersCountInput.value

    if (isNaN(count) || count < 3 || count > 8) {
      alert('Philosophers count must be a number betwen 3 and 8')
      return
    }

    socket.send(JSON.stringify({ type: 'start', philosophersCount: count }))
    resetState()
  })

  el.stopButton.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'stop' }))
    resetState()
  })
}

const main = async () => {
  const socket = new WebSocket(SERVER_URL)
  addEventListeners(socket)
  updateView()

  socket.onmessage = event => {
    state.queue.push(event)
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

  const SIMULATION_SPEED = 200

  while (true) {
    if (state.paused) {
      await sleep(SIMULATION_SPEED)
      continue
    }

    const event = state.queue.shift()

    if (event) {
      parse(event)

      await sleep(SIMULATION_SPEED)
    } else {
      await sleep(SIMULATION_SPEED)
    }
  }
}

main()
