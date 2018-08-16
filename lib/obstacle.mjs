import { position, move } from './../node_modules/tiny-game-engine/lib/position.mjs'
import { el } from './../node_modules/tiny-game-engine/lib/el.mjs'
import { draw } from './draw.mjs'
import { intersects } from './../node_modules/tiny-game-engine/lib/collision.mjs'
import { xyz, vector2 } from './../node_modules/tiny-game-engine/lib/xyz.mjs'
import { availableSpace, edges } from './edges.mjs'
import { worm } from './worm.mjs'
import { portal, shred } from './portal.mjs'
import * as u from './utils.mjs'
import { xyzAsRgba, randomXyz } from './utils.mjs';

export const obstacles = []

function obstacle(pos) {
  return el(pos, xyz(5, 5, 10), {
    color: xyz(175, 255, 195),
    alpha: 0,
    life: 2,
    step: () => {},
    draw (ctx, cw, ch) {
      ctx.fillStyle = xyzAsRgba(this.color, this.alpha)
      ctx.fillRect(this.pos.cor.x - this.dim.x2, this.pos.cor.y - this.dim.y2, this.dim.x, this.dim.y)
    }
  })
}

function blob(pos) {
  const size = u.random(10, 5)
  return el(pos, xyz(size, size, size), {
    color: xyz(175, 255, 195),
    alpha: 0,
    life: 2,
    step (step) { this.dim = this.dim.add(xyz(step, step, step)) },
    draw (ctx, cw, ch) {
      ctx.strokeStyle = xyzAsRgba(this.color, this.alpha)
      ctx.fillStyle = xyzAsRgba(this.color, this.alpha)
      ctx.beginPath()
      ctx.arc(this.pos.cor.x, this.pos.cor.y, 1 + this.dim.x, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fill()
    }
  })
}

function swarm (intensity) {
  const thing = u.sample([obstacle, blob].slice(0, intensity))
  const duration = 100 + intensity * 50
  const frequency = u.sample([0, 20, 50, 100])
  const direction = xyz(u.sample([1, 0, -1]), u.sample([1, 0, -1]))
  const as = availableSpace().sub(xyz(40, 40))
  const range = [
    xyz(u.random(-as.x2, as.x2), u.random(-as.y2, as.y2)),
    xyz(u.random(-as.x2, as.x2), u.random(-as.y2, as.y2))
  ].sort((a, b) => a.size > b.size ? -1 : 1)
  const name = `swarm-${Math.random()}`
  return step => {
    if (timeBasedTurn(name, frequency)) {
      const location = randomXyz(range[0], range[1])
      obstacles.push(thing(position(location, direction.mul(speed))))
    }
  }
}

export function spawnObstacle (dir) {
  const avs = availableSpace()[dir]
  const p = (-avs/2 + 10) + u.random(avs - 20)
  const cor = xyz(dir === 'y' ? -(window.innerWidth/2) + 10 : p, dir === 'x' ? -(window.innerHeight/2) + 10 : p)
  const acc = xyz(dir === 'y' ? 200 : 0, dir === 'x' ? 200 : 0)
  obstacles.push(obstacle(position(cor, xyz(), acc)))
}

function spawnObstacleAt(x, y, rad) {
  obstacles.push(obstacle(position(xyz(x, y), vector2(rad, 200), xyz())))
}

export function blobSwarmer () {
  const a = availableSpace()
  return () => {
    const y = u.random(a.y2, -a.y2)
    obstacles.push(blob(position(xyz(a.x2 - 20, y), vector2(Math.PI, 80), xyz())))
  }
}

export function obstacleSwarmer (intensity = 1.5) {
  const a = availableSpace()
  const y = u.sample([-a.y2, 0])
  const spacing = xyz(16, 16)
  return () => {
    u.range(a.y2 / spacing.y).map(i => {
      spawnObstacleAt(a.x2, y + i * spacing.y + spacing.y2, Math.PI)
    })
  }
}

export function obstacleBlockSwarmer () {
  const a = availableSpace()
  const y = u.sample([-a.y2, 0])
  const spacing = xyz(8, 8)
  return () => {
    u.range(a.y2 / spacing.y).map(i => {
      spawnObstacleAt(a.x2, y + i * spacing.y + spacing.y2, Math.PI)
    })
  }
}

function obstacleQueue () {
  let x = (u.sample([-1, 1])) * (window.innerWidth / 2) * Math.random(),
      y = (u.sample([-1, 1])) * (window.innerHeight / 2) * Math.random(),
      rad = el(position(xyz(x, y, 0))).vectorTo(worm, 1).radian
  u.range(0, 10).map(i => setTimeout(() => spawnObstacleAt(x, y, rad), i * (250 / intensity)))
}

export function obstacleStep (step) {
  obstacles.map((o, i) => {
    o.alpha += step
    o.pos = move(o.pos, step)
    o.step(step)
    draw(o.draw.bind(o), o.pos)
  })

  u.removeAll(obstacles, o => edges.filter(e => intersects(o.pos, o.dim, e.pos, e.dim)).length > 0)
    .map(o => portal(o.pos.cor))

  u.removeAll(obstacles, o => o.life <= 0)
    .map(o => shred(o.pos.cor))

  const a = availableSpace()
  u.removeAll(obstacles, o => (
    o.pos.cor.x < -a.x2 ||
    o.pos.cor.x > a.x2 ||
    o.pos.cor.y < -a.y2 ||
    o.pos.cor.y > a.y2))
}
