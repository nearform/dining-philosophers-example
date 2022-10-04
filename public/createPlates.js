import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { calcX, calcY } from './util.js'

export const createPlates = ({ state }) => {
  const radius = 30
  const margin = (40 * 5) / 3
  const pCount = state.philosophers.length
  const plates = state.philosophers.map((_, idx) => ({
    x: calcX(margin, radius, idx, pCount),
    y: calcY(margin, radius, idx, pCount),
    r: radius
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
