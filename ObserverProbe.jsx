import { Component, useMemo } from 'react'
import { Line, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { observerStop } from '../data/projects'
import { configureProbeMaterial } from './probeMaterial'

function ProbeFallback({ opacity = 1 }) {
  const antennae = [
    [[-1.25, 0, 0], [-3.1, 1.5, 0]],
    [[-1.25, 0, 0], [-3.1, -1.5, 0]],
    [[1.25, 0, 0], [3.1, 1.5, 0]],
    [[1.25, 0, 0], [3.1, -1.5, 0]],
  ]
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.38, 2.5, 16]} />
        <meshStandardMaterial color="#aab5bf" metalness={0.72} roughness={0.34} transparent opacity={opacity} />
      </mesh>
      {antennae.map((points, index) => (
        <Line key={index} points={points} color="#bac5ce" transparent opacity={opacity * 0.82} lineWidth={0.7} />
      ))}
    </group>
  )
}

class ProbeBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <ProbeFallback opacity={this.props.opacity} /> : this.props.children
  }
}

function ExplorerModel({ opacity = 1 }) {
  const { scene } = useGLTF(observerStop.world.model)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const bounds = new THREE.Box3().setFromObject(clone)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const longest = Math.max(size.x, size.y, size.z) || 1
    const scale = observerStop.world.displaySize / longest
    clone.position.sub(center)
    clone.scale.setScalar(scale)
    clone.traverse((child) => {
      if (!child.isMesh || !child.material) return
      child.material = child.material.clone()
      configureProbeMaterial(child.material, opacity)
    })
    return clone
  }, [scene, opacity])

  return <primitive object={model} dispose={null} />
}

export default function ObserverProbe({ opacity = 1, active = false }) {
  return (
    <group rotation={[0.08, -0.38, -0.12]} scale={active ? 1.08 : 1}>
      <ProbeBoundary opacity={opacity}>
        <ExplorerModel opacity={opacity} />
      </ProbeBoundary>
    </group>
  )
}

useGLTF.preload(observerStop.world.model)
