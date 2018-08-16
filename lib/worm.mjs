import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { el } from './../node_modules/tiny-game-engine/lib/el.mjs'
import { portal } from './portal.mjs'
import { draw } from './draw.mjs'
import { edges } from './edges.mjs'
import { obstacles } from './obstacle.mjs'
import Controls from './../node_modules/tiny-game-engine/lib/controls.mjs'
import * as u from './utils.mjs'

const controls = new Controls(window, true, () => xyz(window.innerWidth / 2 + worm.pos.cor.x, window.innerHeight / 2 + worm.pos.cor.y))
const cors = [xyz()]
const maxVel = 200

function jump(cor) {
  worm.pos = position(cor, xyz(u.sample([-1, 1]) * 900), xyz())
  portal(worm.pos.cor)
}

function friction (pos, amount) {
  return position(pos.cor, pos.vel.mul(xyz(1 - amount, 1 - amount)), pos.acc)
}

export const worm = el(position(xyz(), xyz(u.sample([-1, 1]) * 900)), xyz(4, 4, 1))

export function wormStep (step) {
  if (controls.dir.size > 0 && (
    Math.max(controls.dir.angle, worm.pos.vel.mul(xyz(1, -1)).angle) -
    Math.min(controls.dir.angle, worm.pos.vel.mul(xyz(1, -1)).angle)) > 25) {
    worm.pos.vel = vector2(controls.dir.radian, maxVel).mul(xyz(1, -1))
  }

  worm.move(step)
  if (worm.pos.vel.sum() > maxVel) worm.pos = friction(worm.pos, 0.03)

  cors.splice(0, 0, worm.pos.cor)
  cors.splice(12)

  edges.filter(e => intersects(worm.pos, worm.dim, e.pos, e.dim))
    .map(e => {
      portal(worm.pos.cor)
      jump(xyz())
    })

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
  }, worm.pos, worm.dim)
}
