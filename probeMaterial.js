export function configureProbeMaterial(material, groupOpacity) {
  const sourceOpacity = material.opacity ?? 1
  material.metalness = Math.min(0.72, material.metalness ?? 0.35)
  material.roughness = Math.max(0.3, material.roughness ?? 0.45)
  material.transparent = material.transparent || sourceOpacity < 1 || groupOpacity < 1
  material.opacity = sourceOpacity * groupOpacity
  material.depthWrite = !material.transparent
  return material
}
