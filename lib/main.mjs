import loop from './../node_modules/tiny-game-engine/lib/loop.mjs'
import { bgStep } from './bg.mjs'
import { wormStep } from './worm.mjs'
import { portalStep } from './portal.mjs'
import { obstacleStep } from './obstacle.mjs'
import { policeStep } from './police.mjs'
import { edgesStep } from './edges.mjs'
import { stageStep } from './stage.mjs'

const stopGameLoop = loop(step => {
  bgStep(step)
  wormStep(step)
  portalStep(step)
  obstacleStep(step)
  policeStep(step)
  edgesStep(step)
  stageStep(step)
})
