import { availableSpace, sendEdgesOut, sendEdgesOutish, pullEdgesIn } from './edges.mjs'
import { police, spawnPolice, retreatPolice } from './police.mjs'
import { spawnObstacle, obstacleSwarmer, obstacleBlockSwarmer } from './obstacle.mjs'
import { levelStep } from './level.mjs'
import { iso } from './draw.mjs'
import { bgStep } from './bg.mjs'
import { wormStep } from './worm.mjs'
import { gunStep } from './gun.mjs'
import { portalStep } from './portal.mjs'
import { obstacleStep } from './obstacle.mjs'
import { policeStep } from './police.mjs'
import { edgesStep } from './edges.mjs'
import { planetStep, pullPlanetUp } from './planet.mjs'

let nextDir = 'x'
let nextSize = 100
let wantedRate = 0
let stage

export function increaseWanted () {
  wantedRate = Math.min(wantedRate + 1, 5)
}

function attackStage(step) {
  bgStep(step)
  wormStep(step)
  gunStep(step)
  portalStep(step)
  obstacleStep(step)
  edgesStep(step)
  levelStep(step)
}

function normalSpaceStage(step) {
  bgStep(step)
  wormStep(step)
  gunStep(step)
  portalStep(step)
  obstacleStep(step)
  policeStep(step)
  edgesStep(step)
  planetStep(step)
}

function hyperspaceStage(step) {
  bgStep(step)
  wormStep(step)
  gunStep(step)
  portalStep(step)
  obstacleStep(step)
  policeStep(step)
  edgesStep(step)

  // if (timeBasedTurn('stage', stageChangeTime)) {
  //   nextDir = u.sample(['x', 'y'])
  //   nextSize = u.random(60, 200)
  //   edgeResize(nextDir === 'x' ? nextSize : window.innerWidth, nextDir === 'y' ? nextSize : window.innerHeight)
  // }

  if (availableSpace()[nextDir] <= nextSize) {
    if (police.length < wantedRate) spawnPolice(nextDir)
    if (Math.random() > 0.8) spawnObstacle(nextDir)
    if (police.filter(p => !!p.hook).length >= 4) {
      gotoNormalSpace()
    }
  }
}

function gotoNormalSpace() {
  sendEdgesOut()
  retreatPolice()
  iso()
  setTimeout(pullPlanetUp, 400)
  stage = normalSpaceStage
}

function gotoHyperSpace () {
  pullEdgesIn(nextDir, nextSize)
  stage = hyperspaceStage
}

function gotoAttackStage () {
  sendEdgesOutish()
  stage = attackStage
}

gotoAttackStage()
export function stageStep (step) {
  stage(step)
}