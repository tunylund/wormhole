export function random(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function range(minormax, max) {
  max = max || minormax
  let res = []
  let min = max ? minormax : 0
  for (let i = min; i <= max; i++) {
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