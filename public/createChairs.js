import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { convertStatus, calcX, calcY } from './util.js'

export const createChairs = ({ state }) => {
  const pCount = state.philosophers.length

  const radius = 40
  const margin = 160
  const chairs = state.philosophers.map((_, idx) => ({
    status: state.philosophers[idx],
    x: calcX(margin, radius, idx, pCount),
    y: calcY(margin, radius, idx, pCount),
    r: radius
  }))

  d3.select('.chairs').selectAll('circle').remove()
  d3.select('.chairs').selectAll('text').remove()

  const c = d3.select('.chairs').selectAll('circle').data(chairs).enter()
  const Colors = {
    thinking: 'lightblue',
    hungry: 'indianred',
    eating: 'darkseagreen'
  }

  c.append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .attr('fill', d => Colors[convertStatus(d.status)])

  c.append('text')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .text(d => convertStatus(d.status))
}
