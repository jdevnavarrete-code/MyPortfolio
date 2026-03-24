import { useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform vec2 uMouse;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    // Fresnel: centro oscuro (visto de frente), borde brillante (accretion disk)
    float NdotV = max(dot(N, V), 0.0);
    float fresnel = pow(1.0 - NdotV, 1.8);
    float fresnelSoft = pow(1.0 - NdotV, 0.9);

    // Centro tipo agujero negro: rojo muy oscuro
    vec3 blackHoleCore = vec3(0.15, 0.0, 0.0);
    vec3 eventHorizon = vec3(0.45, 0.02, 0.0);

    // Disco de acreción / corona roja intensa en el borde
    vec3 accretionRim = vec3(1.0, 0.08, 0.02);
    vec3 accretionGlow = vec3(1.0, 0.12, 0.03);

    // Gradiente radial: centro oscuro → borde brillante
    float radial = fresnel;
    vec3 color = mix(blackHoleCore, eventHorizon, 1.0 - radial * 0.7);
    color = mix(color, accretionRim, smoothstep(0.25, 0.8, radial));
    color += accretionGlow * fresnel * 1.1;

    // Sutil rotación/anillo en el ecuador
    float angle = atan(N.y, N.x);
    float ring = abs(sin(angle * 2.0 + uTime * 0.15)) * (1.0 - NdotV);
    color += vec3(1.0, 0.1, 0.02) * ring * 0.6;

    // Glow exterior
    float alpha = 0.08 + fresnelSoft * 0.25 + fresnel * 0.7 + ring * 0.3;
    alpha = clamp(alpha, 0.0, 0.95);

    gl_FragColor = vec4(color, alpha);
  }
`

function SphereMesh({ mouseRef }) {
  const meshRef = useRef()
  const matRef = useRef()

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return
    const t = clock.getElapsedTime()
    matRef.current.uniforms.uTime.value = t
    matRef.current.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)

    const targetRotX = -mouseRef.current.y * 3.5
    const targetRotY = mouseRef.current.x * 3.5
    const targetPosX = mouseRef.current.x * 0.16
    const targetPosY = mouseRef.current.y * 0.12
    const targetRotZ = mouseRef.current.x * 0.35

    meshRef.current.position.x += (targetPosX - meshRef.current.position.x) * 0.14
    meshRef.current.position.y += (targetPosY - meshRef.current.position.y) * 0.14
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.18
    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.18
    meshRef.current.rotation.z += (targetRotZ - meshRef.current.rotation.z) * 0.12
    meshRef.current.scale.setScalar(0.72)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.82, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
        }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function IridescentSphere({ size = "0.65em" }) {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <span
      style={{
        display: "block",
        width: size,
        height: size,
        overflow: "visible",
        isolation: "isolate",
        background: "transparent",
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.1], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 3, 2]} intensity={1.0} color="#ffffff" />
        <pointLight position={[-1, -0.5, 1]} intensity={0.4} color="#ffffff" />
        <pointLight position={[1, 0.5, 1]} intensity={0.3} color="#ffffff" />
        <SphereMesh mouseRef={mouseRef} />
      </Canvas>
    </span>
  )
}
