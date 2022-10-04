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
  running: false,
  philosophers: new Array(5).fill(Status.thinking),
  forks: new Array(5).fill(-1)
})

const state = defaultState()

const updateView = newState => {
  createTable()
  createForks({ state, newState })
  createChairs({ state, newState })
  createPlates({ state, newState })
}

const resetState = () => {
  state.running = false
  state.philosophers = defaultState().philosophers
  state.forks = defaultState().forks
  // updateView(state)
}

const main = async () => {
  // eslint-disable-next-line
  const socket = new WebSocket(SERVER_URL)
  const queue = []

  d3.select('body').attr('width', CANVAS_W).attr('height', CANVAS_H)
  // eslint-disable-next-line
  document.querySelector('#start-button').addEventListener('click', () => {
    socket.send('start')
  })

  // TODO: Implement pause/stop server side
  // document.querySelector('#start-button').addEventListener('click', () => {
  //   socket.send('pause')
  // })

  // eslint-disable-next-line
  document.querySelector('#stop-button').addEventListener('click', () => {
    socket.send('stop')
    resetState()
    queue.length = 0
  })

  socket.onmessage = event => {
    // TODO: Add some error handling here
    queue.push(event)
  }

  const parse = event => {
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

    // console.table({
    //   payload: message.payload,
    //   forks: state.forks,
    //   phi: state.philosophers.map(f => {
    //     switch (f) {
    //       case 0:
    //         return 'thinking'
    //       case 1:
    //         return 'hungry'
    //       case 2:
    //         return 'eating'
    //     }
    //   })
    // })

    updateView(state)
  }

  while (true) {
    const event = queue.shift()
    if (event) {
      // console.log('Parsing msg', event.data)
      parse(event)
      await new Promise(r => setTimeout(r, 400))
    } else {
      await new Promise(r => setTimeout(r, 100))
    }
  }
}

main()
