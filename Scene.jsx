import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { detectTier, resolveBudget } from '../lib/perf'
import { SCENE_STAGE, useCosmos } from '../state/store'
import CameraRig from './CameraRig'
import DeepSpace from './DeepSpace'
import NearDust from './NearDust'
import PersonalGalaxy from './PersonalGalaxy'
import StellarSystem from './StellarSystem'
import { sceneWeightsForProgress } from './cameraTargets'

function World({ activeBudget, mobile }) {
  const stage = useCosmos((state) => state.stage)
  const journeyProgress = useCosmos((state) => state.journeyProgress)
  const weights = sceneWeightsForProgress(journeyProgress)
  const reading = stage === SCENE_STAGE.READING
  const showMarker = journeyProgress < 0.24
  const dustCount = mobile ? 0 : activeBudget.nearDust

  return (
    <>
      <color attach="background" args={['#02040a']} />
      <fogExp2 attach="fog" args={['#02040a', weights.system > 0.5 ? 0.009 : 0.0045]} />
      <CameraRig />
      <DeepSpace count={activeBudget.stars} brightCount={activeBudget.brightStars} showMarker={showMarker} opacity={weights.deepSpace} />
      {weights.galaxy > 0.01 && <PersonalGalaxy count={activeBudget.nebula} opacity={weights.galaxy} progress={journeyProgress} />}
      {!reading && weights.system > 0.01 && <StellarSystem opacity={weights.system} activeBudget={activeBudget} />}
      {dustCount > 0 && weights.dust > 0.01 && <NearDust count={Math.round(dustCount * weights.dust)} />}
    </>
  )
}

export default function Scene() {
  const deviceTier = useCosmos((state) => state.deviceTier)
  const quality = useCosmos((state) => state.quality)
  const setDeviceTier = useCosmos((state) => state.setDeviceTier)
  const setQuality = useCosmos((state) => state.setQuality)
  const tier = useMemo(detectTier, [])
  const mobile = useMemo(() => window.matchMedia('(max-width: 820px)').matches, [])
  const activeBudget = useMemo(() => resolveBudget(deviceTier, quality), [deviceTier, quality])

  useEffect(() => setDeviceTier(tier), [setDeviceTier, tier])

  return (
    <Canvas
      className="cosmos-canvas"
      dpr={activeBudget.dpr}
      gl={{ antialias: tier === 'high', powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 56, near: 0.1, far: 900, position: [24, 14, 108] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.92
        gl.setClearColor('#02040a')
      }}
    >
      <PerformanceMonitor
        onDecline={() => setQuality('low')}
        onIncline={() => setQuality(tier)}
      />
      <Suspense fallback={null}>
        <World activeBudget={activeBudget} mobile={mobile} />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
