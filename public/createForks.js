import * as d3 from 'https://cdn.skypack.dev/d3@7'
import { calcX, calcY } from './util.js'
import { TABLE_X, TABLE_Y } from './constants.js'

export const createForks = state => {
  const pCount = state.philosophers.length
  const forkSize = 20
  const forkMargin = 70

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
    .attr('x', d => d.x - 4.5)
    .attr('y', d => d.y)
    .attr('width', 9)
    .attr('height', 30)
    .attr('transform', (d, i) => {
      // Local rotation so forks point to center of the circle
      const angle = (pCount - i) * (360 / pCount)
      return `rotate(${angle}, ${d.x} ${d.y})`
    })

  g.attr('transform', (d, i) => {
    if (d.selected === -1) {
      return ''
    }

    const clampMin = (num, min = 0) => (num < min ? min : num)

    const angleFactor = 3 + clampMin(pCount - 4) * 0.5
    const selectedForkAngleOffset = 360 / pCount / angleFactor

    let angle
    if (d.selected === pCount - 1 && i === 0) {
      angle = selectedForkAngleOffset
    } else {
      angle = `${d.selected >= i ? '-' : ''}${selectedForkAngleOffset}`
    }

    return `rotate(${angle}, ${TABLE_X}, ${TABLE_Y})`
  })

  const angle = 360 / pCount / 2

  d3.select('.forks').attr(
    'transform',
    `rotate(${angle}, ${TABLE_X}, ${TABLE_Y})`
  )
}
