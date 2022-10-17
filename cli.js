import { createSimulation } from './simulation.js'

const { start, state } = createSimulation()

start(3)

state.philosophers.forEach(p => p.on('message', console.log))
