import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { calcX, calcY } from './util.js'

export const createPlates = ({ state }) => {
  const pCount = state.philosophers.length
  const plateRadius = 30
  const margin = 80

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
