import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { draw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { xyz } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { increaseWanted } from './stage.mjs'
import * as u from './utils.mjs'

const pos = position(0, 0, -10), dim = xyz()
const colorRange = '0123456789ABCDEF'.split('')
const rc = min => u.sample(colorRange.slice(min, min + 4))
const lightColor = `#${rc(5)}${rc(4)}${rc(11)}${rc(5)}${rc(11)}${rc(10)}`
const rays = []
let r = `${rc(5)}${rc(4)}`, g = `${rc(11)}${rc(5)}`, b = `${rc(11)}${rc(10)}`

export function bgStep (step) {
  draw((ctx, cw, ch) => {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, ch)
    const baseColor = `#${r}${g}${b}`
    bgGradient.addColorStop(0, baseColor)
    bgGradient.addColorStop(1, lightColor)
    ctx.fillStyle = bgGradient
    ctx.fillRect(-cw, -ch, cw * 2, ch * 2)
  }, pos, dim)

  // draw((ctx, cw, ch) => {
  //   ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() / 2})`
  //   if (rays.length < ch) rays.push({
  //     pos: position(cw, u.random(ch, -ch), 0, 0, 0, 0, -100),
  //     width: 1,
  //     height: 1
  //   })
  //   rays.map(r => {
  //     r.pos = move(r.pos, step)
  //     if (r.pos.cor.x < -cw) r.pos.cor = xyz(cw, u.random(ch, -ch), 0)
  //     r.width += step * 2
  //     ctx.fillRect(r.pos.cor.x, r.pos.cor.y, r.width, r.height)
  //   }, r.pos)
  // }, position())
}

export function tintBg () {
  r = (Math.min(Number(`0x${r}`) + 1, 180)).toString(16).padStart(2, '0')
  g = (Math.max(Number(`0x${g}`) - 1, 0)).toString(16).padStart(2, '0')
  b = (Math.max(Number(`0x${b}`) - 1, 0)).toString(16).padStart(2, '0')

  if (`0x${r}` >= 180) {
    increaseWanted()
  } 
}
