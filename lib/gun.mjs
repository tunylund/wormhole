import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { El } from './../node_modules/tiny-game-engine/lib/el.mjs'
import { timeBasedTurn } from './../node_modules/tiny-game-engine/lib/turn.mjs'
import { portal } from './portal.mjs'
import { draw } from './draw.mjs'
import { worm } from './worm.mjs'
import { obstacles } from './obstacle.mjs'
import Controls from './../node_modules/tiny-game-engine/lib/controls.mjs'
import * as u from './utils.mjs'
import { availableSpace } from './edges.mjs';

const controls = new Controls(window, true, () => xyz(window.innerWidth / 2 + worm.pos.cor.x, window.innerHeight / 2 + worm.pos.cor.y))
const pellets = []

class Bullet extends El {
  constructor(pos, dim, gun) {
    super(pos, dim, { gun, strength: gun.level })
  }
}

class Pellet extends Bullet {
  constructor(pos, dim, gun) {
    super(pos, dim, gun)
    this.strength = Math.max(4, gun.level)
  }
  move (step) {
    this.pos = move(this.pos, step)
    obstacles
      .filter(o => intersects(this.pos, this.dim, o.pos, o.dim))
      .map(o => {
        hit(o, this)
        o.pos.vel = o.pos.vel.add(this.vectorTo(o, 100))
      })
  }
  draw () {
    draw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(255, 255, 255, 1)`
      ctx.fillRect(
        this.pos.cor.x - this.dim.x2,
        this.pos.cor.y - this.dim.y2,
        this.dim.x, this.dim.y)
    }, this.pos, this.dim)
  }
}


class Missile extends Bullet {
  constructor(pos, dim, gun) {
    super(pos, dim, gun)
    this.strength = 4
    this.areaEffect = xyz(this.strength * 4, this.strength * 4, this.strength * 4)
  }
  move (step) {
    const huntedObstacles = pellets.map(p => p.target)
    this.target = obstacles.includes(this.target) ? this.target : obstacles
      .filter(o => !huntedObstacles.includes(o))
      .reduce((memo, o) => (!memo || this.dist(o) < this.dist(memo)) ? o : memo, null)

    if (this.target) this.pos.vel = vector2(this.pos.vel.add(this.vectorTo(this.target, 250)).radian, 250)
    this.pos = move(this.pos, step)

    const hits = obstacles
      .filter(o => intersects(this.pos, this.dim, o.pos, o.dim))
      .map(o => {
        portal(
          this.pos.cor,
          0.5,
          this.areaEffect.size / 2,
          xyz(250, 25, 25),
          position(xyz(250, 25, 25)))
        obstacles
          .filter(oo => oo != o && intersects(this.pos, this.dim.mul(this.areaEffect), oo.pos, oo.dim))
          .map(o => hit(o, this, this.strength / (this.dist(o))))
        hit(o, this)
      })
  }
  draw () {
    draw((ctx, cw, ch) => {
      ctx.fillStyle = `rgba(255, 255, 255, 1)`
      ctx.beginPath()
      ctx.arc(this.pos.cor.x, this.pos.cor.y, 1 + this.dim.x, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 155, 155, 1)`
      ctx.beginPath()
      ctx.arc(this.pos.cor.x, this.pos.cor.y, 1 + this.dim.x2/2, 0, 2 * Math.PI)
      ctx.fill()
    }, this.pos, this.dim)
  }
}

class Laser extends Bullet {
  move (step) {
    this.pos = move(this.pos, step)
    obstacles
      .filter(o => intersects(this.pos, this.dim, o.pos, o.dim))
      .map(o => {
        hit(o, this)
      })
  }
  draw () {
    draw((ctx, cw, ch) => {
      let endPoint = this.pos.cor.add(vector2(this.pos.vel.radian, this.dim.size))
      ctx.strokeStyle = `rgba(255, 255, 255, 1)`
      ctx.beginPath()
      ctx.moveTo(this.pos.cor.x, this.pos.cor.y)
      ctx.lineTo(endPoint.x, endPoint.y)
      ctx.stroke()
    }, this.pos, this.dim)
  }
}

class Lightning extends Bullet {
  constructor(pos, dim, gun) {
    super(pos, dim, gun)
    this.strength = Math.max(gun.level, 8)
  }
  move (step) {
    this.strength -= step
    if (this.strength < 0) return this.pos.cor = xyz(Infinity)

    const ix = pellets.indexOf(this)
    if (ix === 0) {
      this.pos.cor = xyz(worm.pos.cor).add(vector2(worm.pos.vel.radian, 10))
    } else {
      const prevPebble = pellets[ix - 1]
      const prevPrevPebble = pellets[ix - 2] || worm
      const nearestObstacle = obstacles
        .filter(o => {
          const angle = prevPebble.vectorTo(o).angle - prevPrevPebble.vectorTo(prevPebble).angle
          const dist = prevPebble.dist(o)
          return Math.abs(angle) < 30 && dist > 0
        })
        .reduce((memo, o) => (!memo || prevPebble.dist(o) < prevPebble.dist(memo)) ? o : memo, null)
      if (nearestObstacle) {
        const dist = prevPebble.dist(nearestObstacle) > 20 ? 20 : prevPebble.dist(nearestObstacle)
        this.pos.cor = prevPebble.pos.cor.add(prevPebble.vectorTo(nearestObstacle, dist))
      } else {
        this.pos.cor = prevPebble.pos.cor.add(vector2(u.sample([Math.PI / 3, -Math.PI / 3], 20)))
      }
    }

    obstacles
      .filter(o => intersects(this.pos, this.dim, o.pos, o.dim))
      .map(o => {
        o.life -= this.strength
        this.strength -= 0.5
      })
  }
  draw () {
    draw((ctx, cw, ch) => {
      const prevPebble = pellets[pellets.indexOf(this) - 1] || worm
      ctx.strokeStyle = `rgba(155, 155, 255, ${Math.random()})`
      ctx.beginPath()
      ctx.moveTo(prevPebble.pos.cor.x, prevPebble.pos.cor.y + u.random(1, -1))
      ctx.lineTo(this.pos.cor.x, this.pos.cor.y + u.random(1, -1))
      ctx.stroke()

      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random()})`
      ctx.beginPath()
      ctx.moveTo(prevPebble.pos.cor.x, prevPebble.pos.cor.y + u.random(1, -1))
      ctx.lineTo(this.pos.cor.x, this.pos.cor.y + u.random(1, -1))
      ctx.stroke()
    }, this.pos, this.dim)
  }
}

const buildGun = barrels => ({
  barrels,
  level: 1,
  count: 0
})
const at = adjustment => worm.pos.cor.add(vector2(worm.pos.vel.radian + adjustment.radian, adjustment.size))
const pointTo = (rad, force = 0) => vector2(worm.pos.vel.radian + rad, worm.pos.vel.size + force)
const size = s => xyz(s, s, s)
const fireRate = (rate, fn) => gun => timeBasedTurn(fn.toString(), rate) ? fn(gun) : []

const pelletGun = () => buildGun([
    fireRate(250, gun => [
      new Pellet(position(at(xyz()), pointTo(0, 200)), size(4), gun),
      new Pellet(position(at(xyz(20)), pointTo(0, 200)), size(4), gun)
    ]),
    fireRate(100, gun => [new Pellet(position(at(xyz(10)), pointTo(0, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0, 5)), pointTo(0, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0, -5)), pointTo(0, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0)), pointTo(Math.PI / 16, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0)), pointTo(-Math.PI / 16, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0)), pointTo(Math.PI / 8, 200)), size(4), gun)]),
    fireRate(125, gun => [new Pellet(position(at(xyz(0)), pointTo(-Math.PI / 8, 200)), size(4), gun)]),
    fireRate(125, gun => [
      new Pellet(position(at(xyz(0, 5)), pointTo(Math.PI, worm.pos.vel.size * 2)), size(4), gun),
      new Pellet(position(at(xyz()), pointTo(Math.PI, worm.pos.vel.size * 2)), size(4), gun),
      new Pellet(position(at(xyz(0, -5)), pointTo(Math.PI, worm.pos.vel.size * 2)), size(4), gun)
    ])
  ])

const missileGun = () => buildGun([
    fireRate(125, gun => [new Missile(position(at(xyz()), pointTo(0, 350)), size(2), gun)]),
    fireRate(125, gun => [new Missile(position(at(xyz()), pointTo(-Math.PI / 12, 350)), size(2), gun)]),
    fireRate(125, gun => [
      new Missile(position(at(xyz()), pointTo(Math.PI / 10, 350)), size(2), gun),
      new Missile(position(at(xyz()), pointTo(-Math.PI / 10, 350)), size(2), gun)
    ]),
    fireRate(125, gun => [new Missile(position(at(xyz()), pointTo(Math.PI / 8, 350)), size(2), gun)]),
    fireRate(250, gun => [new Missile(position(at(xyz()), pointTo(Math.PI / 8, 350)), size(2), gun)])
  ])

const laserGun = () => buildGun([
    fireRate(5, gun => [new Laser(position(at(xyz()), pointTo(0, 400)), size(8), gun)]),
    fireRate(5, gun => [new Laser(position(at(xyz(0, 2)), pointTo(0, 400)), size(8), gun)]),
    fireRate(5, gun => [new Laser(position(at(xyz(0, -2)), pointTo(0, 400)), size(8), gun)]),
    fireRate(5, gun => [new Laser(position(at(xyz(0, 4)), pointTo(0, 400)), size(8), gun)]),
    fireRate(5, gun => [new Laser(position(at(xyz(0, -4)), pointTo(0, 400)), size(8), gun)]),
    // fireRate(1, gun => u
    //   .range(-(Math.min(gun.level, 15) - 5), Math.min(gun.level, 15) - 5)
    //   .map(i => new Laser(position(at(xyz(-i)), pointTo(Math.PI / 2 + Math.PI / 32 * i, 400)), size(8), { gun }))),
  ])

const lightningGun = () => buildGun([
    fireRate(250, gun => pellets.length < (1 + Math.min(gun.level, 25)) ? [
      new Lightning(position(at(xyz())), size(4), gun)
    ] : [])
  ])

const guns = [
  pelletGun,
  missileGun,
  laserGun,
  lightningGun
]

let gun = u.sample(guns)()

function hit (o, p, strength) {
  o.life -= strength || p.strength
  p.pos.cor = xyz(Infinity)
}

function shoot (gun) {
  gun.barrels
    .slice(0, gun.level)
    .map(g => g(gun))
    .map(p => pellets.push.apply(pellets, p))
}

const levels = []
export function spawnGunLevel () {
  const a = availableSpace()
  const cor = xyz(a.x2, u.random(a.y2 - 40, -a.y2 + 40))
  levels.push(new Level(position(cor, xyz(-50))))
}

class Level extends El {
  constructor(pos) {
    super(pos, xyz(5, 5, 5))
    this.color = xyz(25, 215, 215)
    this.alpha = 1
    this.glowSize = 1.5
    this.glowDir = 1
  }
  move(step) {
    this.pos = move(this.pos, step)
    if (this.glowSize < 1) { this.glowDir = -this.glowDir }
    if (this.glowSize > 2) { this.glowDir = -this.glowDir }
    this.glowSize += step * this.glowDir * 4
  }
  draw(ctx, cw, ch) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
    ctx.beginPath()
    ctx.arc(this.pos.cor.x, this.pos.cor.y, this.dim.size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = `rgba(${this.color.x}, ${this.color.y}, ${this.color.z}, ${this.alpha / 2}`
    ctx.beginPath()
    ctx.arc(this.pos.cor.x, this.pos.cor.y, this.glowSize, 0, 2 * Math.PI)
    ctx.fill()
  }
}

export function gunStep (step) {
  if ((controls.x || controls.space)) shoot(gun)

  levels.map(l => {
    l.move(step)
    draw(l.draw.bind(l), l.pos, l.dim)
  })

  levels
    .filter(o => intersects(worm.pos, worm.dim, o.pos, o.dim))
    .map(o => {
      portal(o.pos.cor, 1, 5, o.color)
      o.pos.cor = xyz(Infinity)
      gun.level = gun.level + 1
    })

  pellets.map(p => {
    p.move(step)
    p.draw(step)
  })

  u.removeAll(levels, p => (
    p.pos.cor.x < -window.innerWidth ||
    p.pos.cor.x > window.innerWidth ||
    p.pos.cor.y < -window.innerHeight ||
    p.pos.cor.y > window.innerHeight))

  u.removeAll(pellets, p => (
    p.pos.cor.x < -window.innerWidth ||
    p.pos.cor.x > window.innerWidth ||
    p.pos.cor.y < -window.innerHeight ||
    p.pos.cor.y > window.innerHeight))
}