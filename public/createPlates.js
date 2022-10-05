import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { TABLE_RADIUS } from './constants.js'
import { calcX, calcY } from './util.js'

export const createPlates = ({ state }) => {
  const pCount = state.philosophers.length
  const margin = (TABLE_RADIUS / 2) * (pCount / 3)

  const plateRadius = 30
  const plates = state.philosophers.map((_, idx) => ({
    x: calcX(margin, plateRadius, idx, pCount),
    y: calcY(margin, plateRadius, idx, pCount),
    r: plateRadius
  }))

  d3.select('.plates').selectAll('circle').remove()

  d3.select('.plates')
    .selectAll('circle')
    .data(plates)
    .enter()
    .append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .attr('fill', 'beige')
}
