import {
  Status,
  UpdateType,
  SERVER_URL,
  DEFAULT_PHILOSOPHERS_COUNT,
  SIMULATION_SPEED
} from './constants.js'
import { createForks } from './createForks.js'
import { createPlates } from './createPlates.js'
import { createTable } from './createTable.js'
import { createChairs } from './createChairs.js'
import { sleep } from './util.js'

const startButton = document.querySelector('#start-button')
const resetButton = document.querySelector('#reset-button')
const philosophersInput = document.querySelector('#philosophers-count')

const defaultState = (count = DEFAULT_PHILOSOPHERS_COUNT) => ({
  stopped: true,
  philosophers: new Array(count).fill(Status.thinking),
  forks: new Array(count).fill(-1),
  queue: []
})

const updateView = state => {
  createTable(state)
  createForks(state)
  createChairs(state)
  createPlates(state)
}

const resetState = state => {
  const count = +philosophersInput.value
  Object.assign(state, defaultState(count))
  updateView(state)
}

const validateInput = () => {
  const count = +philosophersInput.value

  if (isNaN(count) || count < 3 || count > 8) {
    alert('Philosophers count must be a number between 3 and 8')
    philosophersInput.value = DEFAULT_PHILOSOPHERS_COUNT
  }
}

const addEventListeners = (socket, state) => {
  philosophersInput.addEventListener('change', () => {
    validateInput()
    resetState(state)
  })

  startButton.addEventListener('click', function () {
    state.stopped = !state.stopped
    this.textContent = state.stopped ? 'Start' : 'Stop'
    philosophersInput.disabled = !state.stopped
    resetButton.disabled = !state.stopped

    socket.send(
      JSON.stringify(
        state.stopped
          ? {
              type: 'stop'
            }
          : {
              type: 'start',
              philosophersCount: state.philosophers.length
            }
      )
    )
  })

  resetButton.addEventListener('click', () => {
    resetState(state)
  })
}

const parse = (event, state) => {
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

const main = async () => {
  const state = defaultState()
  const socket = new WebSocket(SERVER_URL)
  addEventListeners(socket, state)
  updateView(state)

  socket.onmessage = event => state.queue.push(event)

  while (true) {
    if (!state.stopped) {
      const event = state.queue.shift()

      if (event) {
        parse(event, state)
      }
    }

    await sleep(SIMULATION_SPEED)
  }
}

main()
