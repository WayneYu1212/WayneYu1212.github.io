export function planetPosition(project) {
  const { radius, phase } = project.world.orbit
  return [
    Math.cos(phase) * radius,
    Math.sin(phase * 1.7) * 0.8,
    Math.sin(phase) * radius * 0.38,
  ]
}

export function orbitPoints(radius, segments = 72) {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius * 0.38]
  })
}
