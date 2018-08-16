import { worm } from './worm.mjs'
import { spawnGunLevel } from './gun.mjs'
import { randomBg } from './bg.mjs'
import { availableSpace } from './edges.mjs'
import { timeBasedTurn } from './../node_modules/tiny-game-engine/lib/turn.mjs'
import { el } from './../node_modules/tiny-game-engine/lib/el.mjs'
import { position } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { portal, shred } from './portal.mjs'
import { blobSwarmer, obstacleSwarmer, obstacleBlockSwarmer } from './obstacle.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { draw } from './draw.mjs'
import * as u from './utils.mjs'

const levelRota = []
const swarms = []
let intensity = 1

function randomSpawner(intensity) {
  return u.sample([{
    time: 1 * intensity,
    name: 'blob-swarm-' + Math.random(),
    step: 20 * intensity,
    swarm: blobSwarmer()
  }
  /*
  , {
    time: 1 * intensity,
    name: 'obstacle-swarm-' + Math.random(),
    step: 40 * intensity,
    swarm: obstacleSwarmer()
  }, {
    time: 1 * intensity,
    name: 'obstacle-block-' + Math.random(),
    step: 20 * intensity,
    swarm: obstacleBlockSwarmer()
  }*/
])
}

function drawRota(rota) {
  draw((ctx, cw, ch) => {
    const as = availableSpace()
    ctx.fillStyle = u.xyzAsRgba(rota.color, 0.5)
    ctx.fillRect(
      rota.pos.cor.x - rota.dim.x2,
      rota.pos.cor.y - rota.dim.y2,
      rota.dim.x, rota.dim.y)
    ctx.fillStyle = u.xyzAsRgba(rota.color, 0.25)
    ctx.fillRect(rota.pos.cor.x + rota.dim.x2, rota.pos.cor.y - as.y2, as.x2 - rota.pos.cor.x, as.y)
  }, rota.pos, rota.dim)
}

export function levelStep (step) {
  if (timeBasedTurn('next-swarm', 5000)) {
    swarms.push(randomSpawner(intensity))
  }

  swarms.map(s => {
    s.time -= step
    if (timeBasedTurn(s.name, s.step)) {
      s.swarm(intensity)
    }
  })

  u.removeAll(swarms, s => s.time <= 0)

  levelRota.map(rota => {
    rota.move(step)
    drawRota(rota)
    if (timeBasedTurn('bling-rota', 2500)) {
      portal(rota.pos.cor)
    }
  })

  levelRota
    .filter(o => intersects(worm.pos, worm.dim, o.pos, o.dim))
    .map(o => {
      intensity++
      randomBg()
      randomSpawner()
      spawnGunLevel()

      u.range(15).map(i => {
        setTimeout(() => shred(worm.pos.cor, 2, o.color, 0.5), i * 10)
      })

      const s = worm.pos.cor
      const a = availableSpace()
      // u.range(-a.y2 / 8, s.y).reverse().map((y, i) => {
      //   setTimeout(() => shred(xyz(s.x, y), 2, o.color, 0.5), 4 * i)
      // })
      // u.range(s.y, a.y2 / 8).map((y, i) => {
      //   setTimeout(() => shred(xyz(s.x, y), 2, o.color, 0.5), 4 * i)
      // })
      o.pos.cor = xyz(Infinity)
  })

  if (timeBasedTurn('scene-rota', 25000)) {
    levelRota.push(el(position(availableSpace().x2, 0, 0, -100), xyz(4, availableSpace().y, 20), {
      color: xyz(Math.min(125 + intensity * 25, 225), Math.max(255 - intensity * 15, 95), Math.max(255 - intensity * 15, 75))
    }))
  }
}