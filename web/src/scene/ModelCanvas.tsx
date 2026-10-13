import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Box3, Group, MathUtils, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

function Model({ url, reducedMotion, active, onReady }: { url: string; reducedMotion: boolean; active: boolean; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, url)
  const group = useRef<Group>(null)
  const { size: viewport, camera, invalidate } = useThree()
  const model = useMemo(() => {
    const scene = clone(gltf.scene)
    scene.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(scene)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const largestSide = Math.max(size.x, size.y, size.z)
    if (!Number.isFinite(largestSide) || largestSide <= 0) throw new Error('Model has no visible geometry')
    const scale = 3.6 / largestSide
    // Center and fit geometry; no dependency on model object names or embedded cameras.
    scene.position.sub(center)
    const wrapper = new Group()
    wrapper.add(scene)
    wrapper.scale.setScalar(scale)
    return { object: wrapper, size: size.multiplyScalar(scale) }
  }, [gltf.scene])

  const aspect = viewport.width / Math.max(viewport.height, 1)
  const halfFov = MathUtils.degToRad(37 / 2)
  const distance = Math.max(
    model.size.y / (2 * Math.tan(halfFov)),
    model.size.x / (2 * Math.tan(halfFov) * aspect),
  ) * 1.16 + model.size.z / 2
  const motionScale = window.matchMedia('(max-width: 700px)').matches ? 0.4 : 1

  useEffect(() => {
    camera.position.set(0, 0.12, distance)
    camera.lookAt(0, 0.05, 0)
    invalidate()
    onReady()
  }, [camera, distance, invalidate, onReady])

  useEffect(() => {
    if (active) invalidate()
  }, [active, invalidate])

  useFrame(({ camera }, delta) => {
    if (reducedMotion) return
    const availableScroll = document.documentElement.scrollHeight - window.innerHeight
    const progress = availableScroll > 0 ? MathUtils.clamp(window.scrollY / availableScroll, 0, 1) : 0
    const damping = 1 - Math.exp(-delta * 3)
    const angle = (-0.12 + Math.sin(progress * Math.PI * 1.5) * 0.23) * motionScale
    if (group.current) group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, angle, damping)
    camera.position.y = MathUtils.lerp(camera.position.y, 0.12 + progress * 0.3 * motionScale, damping)
    camera.position.z = MathUtils.lerp(camera.position.z, distance - Math.sin(progress * Math.PI) * 0.1 * motionScale, damping)
    camera.lookAt(0, 0.05, 0)
  })

  return <group ref={group}><primitive object={model.object} dispose={null} /></group>
}

export default function ModelCanvas({ url, reducedMotion, active, onReady }: { url: string; reducedMotion: boolean; active: boolean; onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0.12, 6.5], fov: 37, near: 0.01, far: 100 }}
      dpr={[1, 1.5]}
      frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      fallback={null}
    >
      <ambientLight intensity={1.1} color="#e9eadb" />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff0d5" />
      <directionalLight position={[-3, 2, -2]} intensity={2} color="#8cae91" />
      <Suspense fallback={null}>
        <Model url={url} reducedMotion={reducedMotion} active={active} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
