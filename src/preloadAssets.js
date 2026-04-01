/**
 * Imágenes críticas del home / work — precargadas antes de montar la app.
 * Mantén esta lista al día si añades assets nuevos en Hero, About o Scene.
 */
import bannerBg from "./assets/iamges/banner1.jpeg"
import jordyPhoto from "./assets/iamges/test1.jpg"
import farmaWebStill from "./assets/iamges/FarmaWeb.jpg"
import ecuaflowersStill from "./assets/iamges/ecuaflowers.jpg"
import minAppStill from "./assets/iamges/MIndApp.jpg"
import emergencyAppStill from "./assets/iamges/emergencyapp.jpg"
import venusStill from "./assets/iamges/Venus.jpg"

export const PRELOAD_IMAGE_URLS = [
  bannerBg,
  jordyPhoto,
  farmaWebStill,
  ecuaflowersStill,
  minAppStill,
  emergencyAppStill,
  venusStill,
]

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = () => resolve(src)
    img.src = src
  })
}

export function preloadPortfolioImages(onProgress) {
  const urls = [...PRELOAD_IMAGE_URLS]
  const total = urls.length
  let done = 0

  return Promise.all(
    urls.map((src) =>
      loadImage(src).then(() => {
        done += 1
        onProgress?.(done / total)
      }),
    ),
  )
}
