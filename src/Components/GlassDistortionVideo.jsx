import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// Shared global mouse state so events are never blocked by other canvases
const globalMouse = { x: 0.5, y: 0.5 }
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    globalMouse.x = e.clientX / window.innerWidth
    globalMouse.y = e.clientY / window.innerHeight
  })
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2  uMouse;
  uniform vec2  uMouseDir;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uAspect;
  uniform float uVelocity;

  varying vec2 vUv;

  void main() {
    vec2 uv      = vUv;
    vec2 center  = vec2(uMouse.x, 1.0 - uMouse.y);
    vec2 delta   = uv - center;
    delta.x     *= uAspect;
    float dist   = length(delta);

    vec2  distUV  = uv;
    float chroma  = 0.0;
    float rim     = 0.0;

    // ── Circular swirl — always active ─────────────────────────────
    if (dist < uRadius && dist > 0.001) {
      float t  = 1.0 - dist / uRadius;
      float t2 = t * t;

      float angle = (uStrength + uVelocity * 1.8) * t2 * 4.2;
      float ca = cos(angle), sa = sin(angle);
      vec2 rotated = vec2(ca * delta.x - sa * delta.y,
                          sa * delta.x + ca * delta.y);
      rotated.x /= uAspect;
      distUV = center + rotated * (1.0 - t2 * 0.45);

      chroma = t2 * (0.015 + uVelocity * 0.04);
      rim    = smoothstep(0.05, 0.0, abs(dist / uRadius - 1.0)) * 0.35;
    }

    // ── Comet tail — appears when moving ───────────────────────────
    if (uVelocity > 0.05 && dist >= uRadius) {
      vec2 dir    = length(uMouseDir) > 0.001 ? normalize(uMouseDir) : vec2(1.0, 0.0);
      float along = dot(delta, dir);
      float perp  = length(delta - along * dir);

      if (along < 0.0) {
        float tailR    = uRadius * (1.0 + uVelocity * 5.5);
        float na = -along / tailR;
        float np = perp  / uRadius;
        float td = sqrt(na * na + np * np);

        if (td < 1.0) {
          float tf   = (1.0 - td) * (1.0 - td);
          vec2  drag = dir * (1.0 - na) * (1.0 - na) * uVelocity * 0.22;
          drag.x    /= uAspect;
          distUV     = uv + drag;
          chroma     = max(chroma, tf * 0.012 * uVelocity);
          rim        = max(rim, smoothstep(0.06, 0.0, abs(td - 1.0)) * 0.25 * uVelocity);
        }
      }
    }

    // ── Chromatic aberration ────────────────────────────────────────
    vec2 rawD = uv - center;
    rawD.x   *= uAspect;
    vec2 cDir = length(rawD) > 0.001 ? normalize(rawD) * chroma : vec2(0.0);

    float r = texture2D(uTexture, distUV + cDir * 1.5).r;
    float g = texture2D(uTexture, distUV).g;
    float b = texture2D(uTexture, distUV - cDir * 1.5).b;

    // ── Head core glow ─────────────────────────────────────────────
    float glow = smoothstep(uRadius * 0.35, 0.0, dist) * 0.6 * uVelocity;

    gl_FragColor = vec4(r + rim + glow, g + rim * 0.5, b + rim * 0.3, 1.0);
  }
`

export default function GlassDistortionVideo({ videoSrc, imageSrc, onVideoRef }) {
  const meshRef  = useRef(null)
  const { size } = useThree()

  const videoRef    = useRef(document.createElement("video"))
  const textureRef  = useRef(null)
  const smoothMouse = useRef({ x: 0.5, y: 0.5 })
  const prevMouse   = useRef({ x: 0.5, y: 0.5 })
  const smoothDir   = useRef(new THREE.Vector2(0, 0))
  const velocityRef = useRef(0)

  useEffect(() => {
    if (imageSrc) {
      let cancelled = false
      const loader = new THREE.TextureLoader()
      loader.load(imageSrc, (tex) => {
        if (cancelled) { tex.dispose(); return }
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        textureRef.current = tex
      })
      return () => {
        cancelled = true
        const t = textureRef.current
        if (t && !(t.source?.data instanceof HTMLVideoElement)) {
          t.dispose()
          textureRef.current = null
        }
      }
    } else if (videoSrc) {
    const video   = videoRef.current
    const texture = new THREE.VideoTexture(video)
    textureRef.current = texture
    video.src        = videoSrc
    video.muted      = true
    video.loop       = true
    video.playsInline = true
    video.preload    = "auto"
    video.playbackRate = 0.5
    video.play().catch(() => {})
    texture.minFilter      = THREE.LinearFilter
    texture.magFilter      = THREE.LinearFilter
    texture.generateMipmaps = false
    if (onVideoRef) onVideoRef(video)
    return () => {
      video.pause()
      texture.dispose()
    }
    }
  }, [videoSrc, imageSrc, onVideoRef])

  useFrame((_, delta) => {
    if (!meshRef.current?.material?.uniforms) return
    const u = meshRef.current.material.uniforms
    if (textureRef.current && u.uTexture.value !== textureRef.current) u.uTexture.value = textureRef.current

    const mouse  = globalMouse
    const smooth = smoothMouse.current
    const prev   = prevMouse.current
    const aspect = size.width / size.height
    const ls     = Math.min(1, delta * 9)

    smooth.x += (mouse.x - smooth.x) * ls
    smooth.y += (mouse.y - smooth.y) * ls

    const dx  = (mouse.x - prev.x) * aspect
    const dy  = -(mouse.y - prev.y)
    const len = Math.sqrt(dx * dx + dy * dy)

    const vel = Math.min(len * 18, 1.0)
    velocityRef.current += (vel - velocityRef.current) * Math.min(1, delta * 9)

    if (len > 0.0002) {
      const dl = Math.min(1, delta * 12)
      smoothDir.current.x += (dx / len - smoothDir.current.x) * dl
      smoothDir.current.y += (dy / len - smoothDir.current.y) * dl
    }

    prev.x = mouse.x
    prev.y = mouse.y

    u.uMouse.value.set(smooth.x, smooth.y)
    u.uMouseDir.value.copy(smoothDir.current)
    u.uAspect.value   = aspect
    u.uVelocity.value = velocityRef.current

    const tex = textureRef.current
    if (tex?.source?.data?.readyState >= 2) tex.needsUpdate = true
  })

  const aspect = size.width / size.height

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[aspect * 2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture:  { value: textureRef.current ?? new THREE.Texture() },
          uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
          uMouseDir: { value: new THREE.Vector2(0, 0) },
          uRadius:   { value: 0.14 },
          uStrength: { value: 0.6 },
          uAspect:   { value: aspect },
          uVelocity: { value: 0 }
        }}
        depthWrite={false}
      />
    </mesh>
  )
}
