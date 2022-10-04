import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { calcX, calcY } from './util.js'
import { TABLE_X, TABLE_Y } from './constants.js'

export const createForks = ({ state }) => {
  const forkSize = 20
  const forkMargin = (38 * 5) / 3
  const pCount = state.philosophers.length

  const forks = state.forks.map((fork, idx) => {
    const selectedOffset = fork === -1 ? 0 : 80

    return {
      selected: fork,
      x: calcX(forkMargin + selectedOffset, forkSize, idx, pCount),
      y: calcY(forkMargin + selectedOffset, forkSize, idx, pCount)
    }
  })

  d3.select('.forks').selectAll('g').remove()

  const g = d3
    .select('.forks')
    .selectAll('rect')
    .data(forks)
    .enter()
    .append('g')

  g.append('rect')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', 9)
    .attr('height', 30)
    .attr('transform', (d, i) => {
      const angle = (pCount - i) * (360 / pCount)

      return `rotate(${angle}, ${d.x} ${d.y})`
    })

  g.attr('transform', (d, i) => {
    if (d.selected === -1) {
      return ''
    }

    const angle = d.selected >= i ? '-22' : '22'

    return `rotate(${angle}, ${TABLE_X}, ${TABLE_Y})`
  })

  d3.select('.forks').attr('transform', `rotate(37.5, ${TABLE_X}, ${TABLE_Y})`)
}
