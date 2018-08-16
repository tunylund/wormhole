import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { draw } from './draw.mjs'
import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { el } from './../node_modules/tiny-game-engine/lib/el.mjs'
import * as u from './utils.mjs'

const portals = [],
      shreds = [],
      dim = xyz(11, 11)

export function shred (cor, scale = 5, color = xyz(255, 255, 255), alpha = 1) {
  shreds.push(el(position(cor.add(xyz(dim.x2, dim.y2))), dim, {
    alpha, scale, color
  }))
}

export function portal (cor, alpha = 1, scale = 5, color = xyz(255, 255, 255), fillColor) {
  portals.push(el(
    position(cor.add(xyz(dim.x2, dim.y2))), dim, {
      alpha,
      scale,
      color,
      fillColor
    }))
}

export function portalStep (step) {
  shreds.map(s => {
    s.pos = move(s.pos, step)
    s.alpha -= step
    s.scale += step * 40
    draw(ctx => {
      ctx.fillStyle = `rgba(${s.color.x}, ${s.color.y}, ${s.color.z}, ${s.alpha}`
      ctx.fillRect(s.pos.cor.x - s.scale, s.pos.cor.y - s.scale, 2, 2)
      ctx.fillRect(s.pos.cor.x - s.scale, s.pos.cor.y + s.scale, 2, 2)
      ctx.fillRect(s.pos.cor.x + s.scale, s.pos.cor.y - s.scale, 2, 2)
      ctx.fillRect(s.pos.cor.x + s.scale, s.pos.cor.y + s.scale, 2, 2)
    }, s.pos)
  })

  portals.map(p => {
    p.alpha -= step
    p.scale += step * 10
    if (p.fillColor) p.fillColor = move(p.fillColor, step)
    draw(ctx => {
      ctx.strokeStyle = `rgba(${p.color.x}, ${p.color.y}, ${p.color.z}, ${p.alpha}`
      ctx.beginPath()
      ctx.arc(p.pos.cor.x - p.dim.x2, p.pos.cor.y - p.dim.y2, p.scale, 0, 2 * Math.PI)
      ctx.stroke()
      if (p.fillColor) {
        ctx.fillStyle = `rgba(${p.fillColor.cor.x}, ${p.fillColor.cor.y}, ${p.fillColor.cor.z}, ${p.alpha / 10}`
        ctx.fill()
      }
    }, p.pos)
  })

  u.removeAll(portals, p => p.alpha <= 0)
  u.removeAll(shreds, s => s.alpha <= 0)
}
