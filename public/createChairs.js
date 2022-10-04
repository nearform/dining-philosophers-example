import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { convertStatus, calcX, calcY } from './util.js'

export const createChairs = ({ state }) => {
  const chairSize = 40
  const chairMargin = (90 * 5) / 3
  const pCount = state.philosophers.length
  const chairs = state.philosophers.map((_, idx) => ({
    status: state.philosophers[idx], // eating, thinking, waiting
    x: calcX(chairMargin, chairSize, idx, pCount),
    y: calcY(chairMargin, chairSize, idx, pCount),
    r: chairSize
  }))

  d3.select('.chairs').selectAll('circle').remove()
  d3.select('.chairs').selectAll('text').remove()

  const c = d3.select('.chairs').selectAll('circle').data(chairs).enter()
  console.log(chairs)
  c.append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .attr('fill', 'dodgerblue')

  c.append('text')
    .attr('x', d => d.x - 10)
    .attr('y', d => d.y)
    .text((d, i) => `${i} \n [${convertStatus(d.status)}]`)
}
