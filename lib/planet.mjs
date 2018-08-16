import { draw, drawing } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { draw as gameDraw } from './draw.mjs'
import { position } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { valueOverTime } from './../node_modules/tiny-game-engine/lib/animation.mjs'
import * as u from './utils.mjs'

const baseColor = xyz(u.random(98, 54), u.random(249, 111), u.random(254, 116))
let lightColor = xyz()
let pos = position(0, window.innerHeight)
const holes = []

export function pullPlanetUp () {
  lightColor = xyz(u.random(98, 54), u.random(249, 111), u.random(254, 116))
  valueOverTime(nextValue => {
    pos.cor = xyz(0, nextValue)
  }, pos.cor.y, 0, 10, 400)
}

function spawnHole () {
  let hole = {
    pos: position(u.random(window.innerWidth, -window.innerWidth / 2), u.random(window.innerHeight, 0), 0),
    dim: xyz(0, 0, 0),
    life: 40
  }
  holes.push(hole)
  valueOverTime(nextValue => hole.dim = xyz(nextValue, nextValue, nextValue), 0, u.random(40, 20), 1, 2000)
  valueOverTime(nextValue => hole.life = nextValue, hole.life, 0, 0.001, 8000)
  // valueOverTime(nextValue => hole.pos.cor = xyz(nextValue, hole.pos.cor.y, hole.pos.cor.z), hole.pos.cor.x, -window.innerWidth, 1, 12000)
}

export function planetStep (step) {
  // if (pos.cor.y === 0) {
  //   if (Math.random() > 0.8) spawnHole()
  // }

  draw((ctx, cw, ch) => {
    ctx.transform(1, 0, 0, 1, 0, pos.cor.y, 0)
    ctx.beginPath()
    ctx.moveTo(-cw, ch)
    ctx.lineTo(-cw, -ch / 2)
    ctx.bezierCurveTo(-cw / 2, -ch / 2, cw / 4, -ch / 2, cw, 0)
    ctx.lineTo(cw, ch)
    ctx.lineTo(-cw, ch)
    const planetGradient = ctx.createLinearGradient(-cw, ch, cw, ch)
    planetGradient.addColorStop(0, `rgba(${baseColor.x}, ${baseColor.y}, ${baseColor.z}, 0.1)`)
    planetGradient.addColorStop(1, `rgba(${lightColor.x}, ${lightColor.y}, ${lightColor.z}, 0.5)`)
    ctx.fillStyle = planetGradient
    ctx.fill()
  }, pos)

  const arch = 4
  holes.map(hole => {
    gameDraw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(0, 0, 0, ${hole.life})`
      ctx.beginPath()
      ctx.moveTo(hole.pos.cor.x - hole.dim.x2, hole.pos.cor.y - hole.dim.y2)
      ctx.bezierCurveTo(
        hole.pos.cor.x - hole.dim.x2 / 2, hole.pos.cor.y - hole.dim.y2 - arch,
        hole.pos.cor.x + hole.dim.x2 / 2, hole.pos.cor.y - hole.dim.y2 - arch,
        hole.pos.cor.x + hole.dim.x2, hole.pos.cor.y - hole.dim.y2)
      ctx.lineTo(hole.pos.cor.x + hole.dim.x2, hole.pos.cor.y + hole.dim.y2)
      ctx.bezierCurveTo(
        hole.pos.cor.x + hole.dim.x2 / 2, hole.pos.cor.y + hole.dim.y2 - arch,
        hole.pos.cor.x - hole.dim.x2 / 2, hole.pos.cor.y + hole.dim.y2 - arch,
        hole.pos.cor.x - hole.dim.x2, hole.pos.cor.y + hole.dim.y2)
      ctx.lineTo(hole.pos.cor.x - hole.dim.x2, hole.pos.cor.y - hole.dim.y2)
      ctx.fill()
    }, hole.pos)
  })

  u.removeAll(holes, h => h.life <= 0)
}
