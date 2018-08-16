import { draw as originalDraw } from './../node_modules/tiny-game-engine/lib/draw.mjs'
import { valueOverTime } from './../node_modules/tiny-game-engine/lib/animation.mjs'

let transform = [1, 0, 0, 1, 0, 0]

export function draw(fnOrEl, pos, dim, win = null) {
  originalDraw((ctx, cw, ch) => {
    ctx.transform(...transform)
    ctx.translate(-pos.cor.z, -pos.cor.z)
    if (typeof fnOrEl === 'function') {
        fnOrEl(ctx, cw, ch)
    } else {
        ctx.drawImage(fnOrEl, pos.cor.x - dim.x2, pos.cor.y - dim.y2)
    }
  }, pos, dim, (win || window))
}

export function iso() {
    [0.707, 0.409, -0.707, 0.409, 0, -0.816].map((targetValue, ix) => {
        valueOverTime(nextValue => {
            transform[ix] = nextValue
        }, transform[ix], targetValue, 0.01, 2000)
    })
}

export function d2() {
    [1, 0, 0, 1, 0, 0].map((targetValue, ix) => {
        valueOverTime(nextValue => {
            transform[ix] = nextValue
        }, transform[ix], targetValue, 0.01, 2000)
    })
}
