import { position } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import * as u from './utils.mjs'

const portals = [],
      dim = xyz(11, 11),
      color = xyz(255, 255, 255)

export function portal (cor) {
  portals.push({ pos: position(cor.add(xyz(dim.x2, dim.y2))), alpha: 1, scale: 5, dim, color })
}

export function portalStep (step) {
  portals.map(p => {
    p.alpha -= step
    p.scale += step * 10
    draw(ctx => {
      ctx.strokeStyle = `rgba(${p.color.x}, ${p.color.y}, ${p.color.z}, ${p.alpha}`
      ctx.beginPath()
      ctx.arc(p.pos.cor.x - p.dim.x2, p.pos.cor.y - p.dim.y2, p.scale, 0, 2 * Math.PI)
      ctx.stroke()
    }, p.pos)
  })
  u.removeAll(portals, p => p.alpha <= 0)
}
