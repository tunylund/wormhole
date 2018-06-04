import { availableSpace, edgeResize } from './edges.mjs'
import { police, spawnPolice } from './police.mjs'
import { spawnObstacle } from './obstacle.mjs'

const stageChangeTime = 30000
let nextDir = 'y'
let nextSize = 100
let wantedRate = 0
edgeResize(nextDir === 'x' ? nextSize : window.innerWidth, nextDir === 'y' ? nextSize : window.innerHeight)

export function increaseWanted () {
  wantedRate = Math.min(wantedRate + 1, 5)
}

export function stageStep (step) {

  // if (timeBasedTurn('stage', stageChangeTime)) {
  //   nextDir = u.sample(['x', 'y'])
  //   nextSize = u.random(60, 200)
  //   edgeResize(nextDir === 'x' ? nextSize : window.innerWidth, nextDir === 'y' ? nextSize : window.innerHeight)
  // }

  if (availableSpace()[nextDir] <= nextSize) {
    if (police.length < wantedRate) spawnPolice(nextDir)
    if (Math.random() > 0.8) spawnObstacle(nextDir)
  }
}