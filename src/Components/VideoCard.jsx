import { useRef, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

function createRoundedRectAlphaTexture(size = 256, radiusPercent = 0.12) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  const r = radiusPercent * size
  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.fill()
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export default function VideoCard({ position, url }) {
  const group = useRef()
  const mesh = useRef()

  const video = useRef(document.createElement("video"))
  const texture = useRef(new THREE.VideoTexture(video.current))
  const alphaMap = useMemo(() => createRoundedRectAlphaTexture(360, 0.03), [])

  useEffect(() => {
    const v = video.current
    v.src = url
    v.loop = true
    v.muted = true
    v.playsInline = true
    v.preload = "auto"
    v.load()

    const onLoadedData = () => {
      v.currentTime = 0
      texture.current.needsUpdate = true
    }
    v.addEventListener("loadeddata", onLoadedData)
    return () => v.removeEventListener("loadeddata", onLoadedData)
  }, [url])

  useEffect(() => {
    texture.current.minFilter = THREE.LinearFilter
    texture.current.magFilter = THREE.LinearFilter
    texture.current.generateMipmaps = false
  }, [])

  const targetOpacity = useRef(1)

  useFrame((_, delta) => {
    if (!group.current) return

    const v = video.current
    if (v.readyState >= 2) texture.current.needsUpdate = true

    const worldPos = new THREE.Vector3()
    group.current.getWorldPosition(worldPos)
    const distance = Math.abs(worldPos.x)

    if (distance < 1) {
      if (v.paused) v.play()
    } else {
      v.pause()
      if (v.currentTime > 0.1) v.currentTime = 0
    }

    targetOpacity.current = Math.max(0.4, 1 - (distance / 4) * 0.6)
    const mat = group.current.children[1].material
    const lerpFactor = Math.min(1, delta * 12)
    mat.opacity += (targetOpacity.current - mat.opacity) * lerpFactor
  })

  return (
    <group ref={group} position={position}>
      {/* Dark background - prevents see-through when video has reduced opacity */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[4.2, 2.625]} />
        <meshBasicMaterial color="#0a0a0a" alphaMap={alphaMap} transparent opacity={1} />
      </mesh>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <planeGeometry args={[4.2, 2.625]} />
        <meshBasicMaterial map={texture.current} alphaMap={alphaMap} transparent opacity={1} toneMapped={false} />
      </mesh>
    </group>
  )
}