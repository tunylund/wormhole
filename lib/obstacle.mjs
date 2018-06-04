import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { availableSpace, edges } from './edges.mjs'
import { tintBg } from './bg.mjs'
import { portal } from './portal.mjs'
import * as u from './utils.mjs'

const dim = xyz(5, 5, 10)
const color = [255, 255, 255]

export const obstacles = []

export function spawnObstacle (dir) {
  const avs = availableSpace()[dir]
  const p = (-avs/2 + 10) + u.random(avs - 20)
  const cor = xyz(dir === 'y' ? -(window.innerWidth/2) + 10 : p, dir === 'x' ? -(window.innerHeight/2) + 10 : p)
  const acc = xyz(dir === 'y' ? 200 : 0, dir === 'x' ? 200 : 0)
  const o = { pos: position(cor, xyz(), acc), dim, color, alpha: 0 }
  obstacles.push(o)
}

export function obstacleStep (step) {
  obstacles.map((o, i) => {
    o.alpha += step
    o.pos = move(o.pos, step)

    edges
      .filter(e => intersects(o.pos, o.dim, e.pos, e.dim))
      .map(e => {
        portal(o.pos.cor)
        o.pos.cor = xyz(Infinity)
      })
  
    draw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(${o.color.join(', ')}, ${Math.min(1, o.alpha)})`
      ctx.fillRect(o.pos.cor.x - o.dim.x2, o.pos.cor.y - o.dim.y2, o.dim.x, o.dim.y)
    }, o.pos)
  })

  u.removeAll(obstacles, o => (
    o.pos.cor.x < -window.innerWidth ||
    o.pos.cor.x > window.innerWidth ||
    o.pos.cor.y < -window.innerHeight ||
    o.pos.cor.y > window.innerHeight)).map(o => {
      tintBg()
    })
}
