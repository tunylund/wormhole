import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'

const A = 200, S = 10000, S2 = S/2
const l = { move: () => l.pos, pos: position(-A - S2), dim: xyz(S, S, S) }
const r = { move: () => r.pos, pos: position(+A + S2), dim: xyz(S, S, S) }
const t = { move: () => t.pos, pos: position(0, -A - S2), dim: xyz(S, S, S) }
const b = { move: () => b.pos, pos: position(0, +A + S2), dim: xyz(S, S, S) }
let tint = 255

function movementTo(pos, cor, speed, precision = 0.1) {
  pos.acc = vector2(cor.sub(pos.cor).radian, 100)
  return step => {
    if (cor.sub(pos.cor).radian != pos.acc.radian) {
      pos.vel = pos.acc = vector2(cor.sub(pos.cor).radian, 100)
    }
    if (pos.isAt(cor, 1)) {
      pos = position(cor, xyz(), xyz())
    } else {
      pos = move(pos, step)
    }
    return pos
  }
}

export const edges = [l, r, t, b]

export function availableSpace () {
  return xyz(
    Math.abs(l.pos.cor.x + l.dim.x2) + Math.abs(r.pos.cor.x - r.dim.x2),
    Math.abs(t.pos.cor.y + t.dim.y2) + Math.abs(b.pos.cor.y - b.dim.y2)
  )
}

export function edgeResize (w, h) {
  l.move = movementTo(l.pos, xyz(-w/2 - S2))
  r.move = movementTo(r.pos, xyz(+w/2 + S2))
  t.move = movementTo(t.pos, xyz(0, -h/2 - S2))
  b.move = movementTo(b.pos, xyz(0, h/2 + S2))
}

export function edgesStep (step) {
  // tint = Math.max(tint - step * 10, 0)
  edges.map(a => {
    a.pos = a.move(step)
    draw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(${parseInt(tint)}, ${parseInt(tint)}, ${parseInt(tint)}, 0.5)`
      ctx.fillRect(a.pos.cor.x - a.dim.x2, a.pos.cor.y - a.dim.y2, a.dim.x, a.dim.y)
    }, a.pos)
  })
}