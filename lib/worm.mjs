import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { portal } from './portal.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { availableSpace, edges } from './edges.mjs'
import { obstacles } from './obstacle.mjs'
import Controls from './../node_modules/tiny-game-engine/lib/controls.mjs'
import * as u from './utils.mjs'

const controls = new Controls(window, true, () => xyz(window.innerWidth / 2 + worm.pos.cor.x, window.innerHeight / 2 + worm.pos.cor.y))
const cors = [xyz()]
const turns = []
const maxVel = 200
const maxTurns = 5

function jump(cor) {
  worm.pos = position(cor, xyz(u.sample([-1, 1]) * 900), xyz())
  portal(worm.pos.cor)
}

function friction (pos, amount) {
  return position(pos.cor, pos.vel.mul(xyz(1 - amount, 1 - amount)), pos.acc)
}

export const worm = {
  pos: position(xyz(), xyz(u.sample([-1, 1]) * 900), xyz()),
  dim: xyz(4, 4, 1)
}

export function wormStep (step) {
  if (controls.dir.size > 0 && (
    Math.max(controls.dir.angle, worm.pos.vel.mul(xyz(1, -1)).angle) -
    Math.min(controls.dir.angle, worm.pos.vel.mul(xyz(1, -1)).angle)) > 25) {
    worm.pos.vel = vector2(controls.dir.radian, maxVel).mul(xyz(1, -1))
    turns.splice(0, 0, worm.pos.cor)
    turns.splice(maxTurns)
  }

  worm.pos = move(worm.pos, step)
  if (worm.pos.vel.sum() > maxVel) worm.pos = friction(worm.pos, 0.03)

  cors.splice(0, 0, worm.pos.cor)
  cors.splice(12)

  edges
    .filter(e => intersects(worm.pos, worm.dim, e.pos, e.dim))
    .map(e => {
      portal(worm.pos.cor)
      jump(xyz())
    })

  // turns
  //   .filter((t, i) => i != 0 && intersects(worm.pos, worm.dim, position(t), worm.dim))
  //   .map(t => {
  //     portal(worm.pos.cor)
  //     let a = availableSpace()
  //     jump(xyz(u.random(a.x2, -a.x2), u.random(a.y2, -a.y2)))
  //   })

  obstacles
    .filter(o => intersects(worm.pos, worm.dim, o.pos, o.dim))
    .map(o => {
      o.pos.vel = o.pos.vel.add(vector2(o.pos.cor.sub(worm.pos.cor).radian, 100))
    })

  draw((ctx, cw, ch) => {
    cors.map((cor, i) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - i/12})`
      ctx.fillRect(cor.x - worm.dim.x2, cor.y - worm.dim.y2, worm.dim.x, worm.dim.y)
    })
    turns.map((t, i) => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - i/10}`
      ctx.beginPath()
      ctx.arc(t.x, t.y, 2, 0, 2 * Math.PI)
      ctx.stroke()
    })
  }, worm.pos, worm.dim)
}
