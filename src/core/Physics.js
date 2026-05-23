export const ARENA = {
  width: 960,
  height: 600,
  left: 20,
  top: 20,
  right: 940,
  bottom: 580,
};

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function length(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y) {
  const len = length(x, y);
  if (len <= 0.00001) {
    return { x: 0, y: -1 };
  }
  return { x: x / len, y: y / len };
}

export function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  let dx = circle.x - closestX;
  let dy = circle.y - closestY;
  let distSq = dx * dx + dy * dy;

  if (distSq > circle.radius * circle.radius) {
    return null;
  }

  if (distSq <= 0.00001) {
    const left = Math.abs(circle.x - rect.x);
    const right = Math.abs(rect.x + rect.width - circle.x);
    const top = Math.abs(circle.y - rect.y);
    const bottom = Math.abs(rect.y + rect.height - circle.y);
    const min = Math.min(left, right, top, bottom);
    if (min === left) {
      dx = -1;
      dy = 0;
      distSq = 1;
    } else if (min === right) {
      dx = 1;
      dy = 0;
      distSq = 1;
    } else if (min === top) {
      dx = 0;
      dy = -1;
      distSq = 1;
    } else {
      dx = 0;
      dy = 1;
      distSq = 1;
    }
  }

  const distance = Math.sqrt(distSq);
  const normal = normalize(dx, dy);
  return {
    normal,
    penetration: circle.radius - distance,
    closestX,
    closestY,
  };
}

export function reflectVelocity(entity, normal) {
  const dot = entity.vx * normal.x + entity.vy * normal.y;
  entity.vx -= 2 * dot * normal.x;
  entity.vy -= 2 * dot * normal.y;
}

export function clampSpeed(entity, minSpeed, maxSpeed) {
  const speed = length(entity.vx, entity.vy);
  if (speed <= 0.00001) {
    entity.vx = 0;
    entity.vy = -minSpeed;
    return;
  }
  const clamped = clamp(speed, minSpeed, maxSpeed);
  entity.vx = (entity.vx / speed) * clamped;
  entity.vy = (entity.vy / speed) * clamped;
}

export function enforceVerticalVelocity(entity, minVerticalRatio = 0.22) {
  const speed = length(entity.vx, entity.vy);
  const minVy = speed * minVerticalRatio;
  if (Math.abs(entity.vy) >= minVy) return;
  const sign = entity.vy < 0 ? -1 : 1;
  entity.vy = minVy * sign;
  const xSign = entity.vx < 0 ? -1 : 1;
  entity.vx = Math.sqrt(Math.max(speed * speed - entity.vy * entity.vy, 0)) * xSign;
}

export function paddleBounceVelocity(ball, paddle, speed) {
  const offset = clamp((ball.x - paddle.x) / (paddle.width / 2), -1, 1);
  const angle = (-90 + offset * 65) * (Math.PI / 180);
  ball.vx = Math.cos(angle) * speed;
  ball.vy = Math.sin(angle) * speed;
}
