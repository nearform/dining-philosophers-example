export const SERVER_URL = 'ws://localhost:3000'

// TODO: Get screen size and center it?
export const CANVAS_W = 1200
export const CANVAS_H = 1200
export const TABLE_Y = CANVAS_H / 2.5
export const TABLE_X = CANVAS_W / 2

// amount to increase sizes/margins when changing number of philosophers,
// 15 by default
export const PHILOSOPHERS_COUNT_FACTOR = state => state.philosophers.length / 3

export const UpdateType = {
  thinking: 'thinking',
  hungry: 'hungry',
  eating: 'eating',
  grabbingFork: `grabbingFork`,
  freeingForks: `freeingForks`
}

export const Status = {
  thinking: 0,
  hungry: 1,
  eating: 2
}
