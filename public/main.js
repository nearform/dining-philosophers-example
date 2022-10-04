import * as d3 from 'https://cdn.skypack.dev/d3@7'
import {
  Status,
  UpdateType,
  CANVAS_H,
  CANVAS_W,
  SERVER_URL
} from './constants.js'
import { createForks } from './createForks.js'
import { createPlates } from './createPlates.js'
import { createTable } from './createTable.js'
import { createChairs } from './createChairs.js'

const defaultState = () => ({
  initialized: false,
  philosophers: new Array(5).fill(Status.thinking),
  forks: new Array(5).fill(-1)
})

const state = defaultState()

const resetState = () => {
  state.initialized = false
  state.philosophers = defaultState().philosophers
  state.forks = defaultState().forks
}

const updateView = newState => {
  createTable()
  createForks({ state, newState })
  createChairs({ state, newState })
  createPlates({ state, newState })
  return
}

const main = () => {
  // eslint-disable-next-line
  const socket = new WebSocket(SERVER_URL)

  d3.select('body').attr('width', CANVAS_W).attr('height', CANVAS_H)
  // eslint-disable-next-line
  document.querySelector('#start-button').addEventListener('click', () => {
    socket.send('start')
  })
  // eslint-disable-next-line
  document.querySelector('#stop-button').addEventListener('click', () => {
    socket.send('stop')
    resetState()
  })

  socket.onmessage = event => {
    // TODO: Add some error handling here
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
        state.forks[fork] = -1
        break
      case UpdateType.grabbingFork:
        state.forks[fork] = philosopher
        break
      default:
        console.error('Invalid update type', updateType)
    }

    updateView(state)
  }
}

main()
