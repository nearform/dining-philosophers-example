import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { calcX, calcY } from './util.js'
import { TABLE_RADIUS, TABLE_X, TABLE_Y } from './constants.js'

export const createForks = ({ state }) => {
  const pCount = state.philosophers.length
  const forkSize = 20
  const forkMargin = (TABLE_RADIUS / 2) * (pCount / 3)

  const forks = state.forks.map((fork, idx) => {
    const selectedOffset = fork === -1 ? 0 : TABLE_RADIUS

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

    const selectedForkOffset = 22
    let angle
    if (d.selected === pCount - 1 && i === 0) {
      angle = selectedForkOffset
    } else {
      angle = d.selected >= i ? `-${selectedForkOffset}` : selectedForkOffset
    }

    return `rotate(${angle}, ${TABLE_X}, ${TABLE_Y})`
  })

  d3.select('.forks').attr('transform', `rotate(37.5, ${TABLE_X}, ${TABLE_Y})`)
}
