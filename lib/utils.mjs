import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'

export function random(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function range(minormax, max) {
  const _max = typeof max != 'undefined' ? max : minormax
  const _min = typeof max != 'undefined' ? minormax : 0
  let res = []
  for (let i = _min; i <= _max; i++) {
    res.push(i)
  }
  return res
}

export function sample(arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

export function removeAll(arr, filter) {
  return arr.filter(filter).map(el => arr.splice(arr.indexOf(el), 1) && el)
}

export function xyzAsRgba(xyz, a) {
  return `rgba(${xyz.x},${xyz.y},${xyz.z},${Math.min(Math.max(a, 0), 1)})`
}

export function randomXyz (min, max) {
  return xyz(random(max.x, min.x), random(max.y, min.y), random(max.z, min.z))
}
