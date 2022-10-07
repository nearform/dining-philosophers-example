import { TABLE_X, TABLE_Y } from './constants.js'

export const calcX = (margin, radius, i, pCount) =>
  TABLE_X + (margin + radius) * Math.sin(i * 2 * (Math.PI / pCount))

export const calcY = (margin, radius, i, pCount) =>
  TABLE_Y + (margin + radius) * Math.cos(i * 2 * (Math.PI / pCount))

export const convertStatus = status => {
  switch (status) {
    case 0:
      return 'thinking'
    case 1:
      return 'hungry'
    case 2:
      return 'eating'
  }
}

export const sleep = interval => new Promise(r => setTimeout(r, interval))
