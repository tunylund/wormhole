import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { availableSpace } from './edges.mjs'
import { worm } from './worm.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import * as u from './utils.mjs'

function friction (pos) {
  return position(pos.cor, pos.vel.mul(xyz(0.5, 0.5, 0.5)), pos.acc)
}

function pull (targetPos, pullerPos) {
  const elasticityLength = 50
  const breakLength = 150
  const diff = pullerPos.cor.sub(targetPos.cor)
  const length = diff.size
  const force = length > breakLength ? breakLength : length > elasticityLength ? length - elasticityLength : 0
  const acc = targetPos.acc.add(vector2(diff.radian, Math.max(force, 0)))
  return {
    targetPos: position(targetPos.cor, targetPos.vel, acc),
    pullerPos: position(pullerPos.cor, length > breakLength ? xyz() : pullerPos.vel, length > breakLength ? xyz() : pullerPos.acc)
  }
}

export const police = []

export function spawnPolice (dir = 'y') {
  const avs = availableSpace()[dir]
  const p = (-avs/2 + 10) + u.random(avs - 20)
  const cor = xyz(dir === 'y' ? -(window.innerWidth/2) + 10 : p, dir === 'x' ? -(window.innerHeight/2) + 10 : p)
  const acc = xyz(dir === 'y' ? 200 : 0, dir === 'x' ? 200 : 0)
  police.push({
    pos: position(cor, xyz(1000, 0, 0), xyz()),
    dim: xyz(10, 10, 1),
    alpha: 0
  })
}

export function policeStep (step) {
  police.map(p => {

    if (p.hook) {
      p.pos.acc = vector2(worm.pos.cor.sub(p.pos.cor).radian, 300).mul(xyz(0, -1, 0))
      let { targetPos, pullerPos } = pull(worm.pos, p.pos)
      p.target.pos = targetPos
      p.pos = pullerPos
    } else if (p.target) {
      p.pos.acc = vector2(worm.pos.cor.sub(p.pos.cor).radian, 300)
      if (180 - Math.abs(Math.abs(p.pos.vel.angle - p.pos.acc.angle) - 180) > 60) p.pos = friction(p.pos)
      if (intersects(p.pos, p.dim, p.target.pos, p.target.dim)) p.hook = p.target
    } else {
      if (p.pos.cor.x >= 0) p.pos = friction(p.pos)
      if (p.pos.vel.sum() < 1) p.target = worm
    }

    p.pos = move(p.pos, step)
    p.alpha = Math.min(p.alpha + step*0.85, 1)

    if (p.hook) {
      draw((ctx, cw, ch) => {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`
        ctx.beginPath()
        ctx.moveTo(p.pos.cor.x, p.pos.cor.y)
        ctx.lineTo(p.target.pos.cor.x, p.target.pos.cor.y)
        ctx.closePath()
        ctx.stroke()
      }, p.pos)
    }
    
    draw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
      ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`
      ctx.translate(p.pos.cor.x, p.pos.cor.y)
      ctx.rotate(p.pos.acc.radian)
      ctx.beginPath()
      ctx.moveTo(- p.dim.x2, 0 - p.dim.y2)
      ctx.lineTo(+ p.dim.x2, 0)
      ctx.lineTo(- p.dim.x2, 0 + p.dim.y2)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    }, p.pos)
  })
}
