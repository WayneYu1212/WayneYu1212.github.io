import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { byId, observerStop } from '../data/projects'
import { SCENE_STAGE, useCosmos } from '../state/store'
import { cameraTargetForJourney, cameraTargetForStage } from './cameraTargets'
import { planetPosition } from './worldMath'

const desiredPosition = new THREE.Vector3()
const desiredTarget = new THREE.Vector3()

export default function CameraRig() {
  const { camera } = useThree()
  const stage = useCosmos((state) => state.stage)
  const focused = useCosmos((state) => state.focused)
  const journeyProgress = useCosmos((state) => state.journeyProgress)
  const activeStop = useCosmos((state) => state.activeStop)
  const cameraView = useCosmos((state) => state.cameraView)
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useFrame((state, delta) => {
    const project = focused ? byId(focused) : null
    const stopProject = activeStop ? byId(activeStop) : null
    const bodyPosition = stopProject ? planetPosition(stopProject) : activeStop === 'observer' ? observerStop.world.position : undefined
    const destination = [SCENE_STAGE.PLANET_FOCUS, SCENE_STAGE.READING].includes(stage)
      ? cameraTargetForStage({
        stage,
        project,
        planetPosition: project ? planetPosition(project) : undefined,
        cameraView,
        reducedMotion: reducedMotion.current,
      })
      : cameraTargetForJourney({
        progress: journeyProgress,
        stop: activeStop,
        bodyPosition,
        reducedMotion: reducedMotion.current,
      })

    desiredPosition.fromArray(destination.position)
    desiredTarget.fromArray(destination.target)
    if (![SCENE_STAGE.INTRO, SCENE_STAGE.GALAXY_TRANSIT].includes(stage)) {
      desiredPosition.x += state.pointer.x * 0.85
      desiredPosition.y += state.pointer.y * 0.5
    }

    const speed = reducedMotion.current ? 1 : Math.min(1, delta * (stage === SCENE_STAGE.GALAXY_TRANSIT ? 1.55 : 2.4))
    camera.position.lerp(desiredPosition, speed)
    target.current.lerp(desiredTarget, speed)
    camera.lookAt(target.current)
    camera.rotation.z += destination.roll ?? 0
  })

  return null
}
