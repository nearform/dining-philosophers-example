import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { TABLE_RADIUS, TABLE_X, TABLE_Y } from './constants.js'

export const createTable = ({ state }) => {
  const pCount = state.philosophers.length
  const tableRadius = (TABLE_RADIUS * pCount) / 3

  d3.select('.table').selectAll('circle').remove()

  d3.select('.table')
    .append('circle')
    .attr('cy', TABLE_Y)
    .attr('cx', TABLE_X)
    .attr('r', tableRadius)
    .attr('fill', 'cadetblue')
}
