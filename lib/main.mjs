import loop from './../node_modules/tiny-game-engine/lib/loop.mjs'
import { stageStep } from './stage.mjs'

const stopGameLoop = loop(step => {
  stageStep(step)
})
