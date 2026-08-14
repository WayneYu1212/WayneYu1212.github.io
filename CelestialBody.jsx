import { Component, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import PlanetAtmosphere from './PlanetAtmosphere'

class TextureBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function FallbackBody({ project, opacity }) {
  return (
    <mesh>
      <sphereGeometry args={[project.world.radius, 40, 28]} />
      <meshStandardMaterial color={project.world.surfacePalette[0]} roughness={0.9} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  )
}

function TexturedBody({ project, focused, opacity, textureMax }) {
  const ref = useRef()
  const { gl } = useThree()
  const sourceTexture = useTexture(`/${project.world.textureSet}`)
  const texture = useMemo(() => {
    const image = sourceTexture.image
    if (image?.width > textureMax) {
      const canvas = document.createElement('canvas')
      canvas.width = textureMax
      canvas.height = Math.round(image.height * textureMax / image.width)
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      return new THREE.CanvasTexture(canvas)
    }
    return sourceTexture.clone()
  }, [sourceTexture, textureMax])

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
    texture.needsUpdate = true
    return () => texture.dispose()
  }, [gl, texture])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * (focused ? 0.035 : 0.012 + project.world.orbit.speed * 0.2)
  })

  return (
    <mesh ref={ref} rotation={[0, project.id === 'apple' ? -1.65 : 0, 0]}>
      <sphereGeometry args={[project.world.radius, 64, 40]} />
      <meshStandardMaterial map={texture} color="#ffffff" roughness={0.86} metalness={0.01} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  )
}

export default function CelestialBody({ project, focused = false, opacity = 1, activeBudget }) {
  return (
    <TextureBoundary fallback={<FallbackBody project={project} opacity={opacity} />}>
      <group>
        <TexturedBody
          project={project}
          focused={focused}
          opacity={opacity}
          textureMax={activeBudget?.textureMax ?? 1024}
        />
        <PlanetAtmosphere
          radius={project.world.radius}
          color={project.accent}
          opacity={opacity * (focused ? 0.92 : 0.46)}
          enabled={activeBudget?.atmosphere !== false}
        />
      </group>
    </TextureBoundary>
  )
}
