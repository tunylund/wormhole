import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { xyz, negone } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import * as u from './utils.mjs'
import { xyzAsRgba, randomXyz } from './utils.mjs';

const pos = position(0, 0, -10), dim = xyz()
const rays = []
let gradientPos = position(0, 0, 0, 0, 0.1)
const minColor = xyz(54, 181, 186)
const maxColor = xyz(98, 229, 224)
let topColor = position(randomXyz(xyz(0, 0, 0), maxColor), xyz(-20, -20, -20))
let bottomColor = position(randomXyz(minColor, maxColor), xyz(10, 10, 10))

export function randomBg () {
  topColor = position(randomXyz(xyz(0, 0, 0), maxColor), xyz(-20, -20, -20))
  bottomColor = position(randomXyz(minColor, maxColor), xyz(10, 10, 10))
}

function limitedMove (pos, step, min, max) {
  let result = move(pos, step)
  'xyz'.split('').map((c, ix) => {
    let selectorMatrix = [0, 0, 0]
    selectorMatrix[ix] = 1
    let selector = xyz(...selectorMatrix)
    if (result.cor[c] < min[c]) {
      result.cor = result.cor
        .add(result.cor.mul(negone).mul(selector))
        .add(min.mul(selector))
      result.vel = result.vel.mul(negone.mul(selector))
    }
    if (result.cor[c] > max[c]) {
      result.cor = result.cor
        .add(result.cor.mul(negone).mul(selector))
        .add(max.mul(selector))
      result.vel = result.vel.mul(negone.mul(selector))
    }
  })
  return result
}

function xyzBetween (c, min, max) {
  return xyz(
    c.x < min ? min : c.x > max ? max : c.x,
    c.y < min ? min : c.y > max ? max : c.y,
    c.z < min ? min : c.z > max ? max : c.z
  )
}

export function bgStep (step) {
  gradientPos = limitedMove(gradientPos, step, xyz(0, 0, 0), xyz(0, 0.25, 0))
  topColor = limitedMove(topColor, step, xyz(0, 0, 0), maxColor)
  bottomColor = limitedMove(bottomColor, step, minColor, maxColor)

  draw((ctx, cw, ch) => {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, ch)
    const baseColor = xyzAsRgba(topColor.cor, 1)
    bgGradient.addColorStop(gradientPos.cor.y, baseColor)
    bgGradient.addColorStop(1, xyzAsRgba(bottomColor.cor, 1))
    ctx.fillStyle = bgGradient
    ctx.fillRect(-cw, -ch, cw * 2, ch * 2)
  }, pos, dim)

  draw((ctx, cw, ch) => {
    ctx.fillStyle = `rgba(255, 255, 255, 0.25)`
    if (rays.length < ch) {
      const distance = u.random(10, 1)
      rays.push({
        pos: position(cw, u.random(ch, -ch), u.random(cw, -cw), -500/distance),
        width: 10 / distance,
        height: 1
      })
    }
    rays.map(r => {
      r.pos = move(r.pos, step)
      if (r.pos.cor.x < -cw) r.pos.cor = xyz(cw, u.random(ch, -ch), 0)
      ctx.fillRect(r.pos.cor.x, r.pos.cor.y, r.width, r.height)
    })
  }, position())
}
