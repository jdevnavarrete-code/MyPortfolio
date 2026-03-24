import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

export default function HeroCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / size.height
    camera.left = -aspect
    camera.right = aspect
    camera.top = 1
    camera.bottom = -1
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}
