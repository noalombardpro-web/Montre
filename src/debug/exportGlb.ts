import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { useAtelier, anim } from '../store/useAtelier'

declare global {
  interface Window {
    __atelier?: {
      exportGLB: (id?: string) => Promise<ArrayBuffer>
      scene?: THREE.Scene
      setView?: (pos: number[], target: number[]) => void
      store?: typeof useAtelier
    }
  }
}

/**
 * Expose `window.__atelier.exportGLB()` (dev uniquement) : exporte la montre affichée,
 * assemblée, avec ses nœuds nommés selon parts.json. Utilisé par `npm run export:glb`.
 */
export function exposeExporter(scene?: THREE.Scene, controls?: { setLookAt: (...a: (number | boolean)[]) => unknown }) {
  window.__atelier = {
    scene,
    store: useAtelier,
    setView: (pos, target) => controls?.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2], false),
    exportGLB: async (id?: string) => {
      const s = useAtelier.getState()
      if (id && id !== s.watchId) {
        s.setWatch(id as typeof s.watchId)
        await new Promise((r) => setTimeout(r, 2500))
      }
      s.setMode('normal')
      anim.explode = 0
      await new Promise((r) => setTimeout(r, 400))
      let root: THREE.Object3D | undefined
      for (let i = 0; i < 100 && !root; i++) {
        const found = window.__atelier!.scene!.getObjectByName(`watch-${useAtelier.getState().watchId}`)
        if (found && useAtelier.getState().staged) root = found
        else await new Promise((r) => setTimeout(r, 200))
      }
      if (!root) throw new Error('watch not found')
      await new Promise((r) => setTimeout(r, 3000)) // textures différées
      const clone = root.clone(true)
      // parcours parallèle : userData est cloné en JSON, on récupère les vrais matériaux d'origine
      const src: THREE.Object3D[] = []
      const dst: THREE.Object3D[] = []
      root.traverse((o) => src.push(o))
      clone.traverse((o) => dst.push(o))
      const strip: THREE.Object3D[] = []
      dst.forEach((o, i) => {
        if ((o as THREE.LineSegments).isLineSegments) strip.push(o)
        const mesh = o as THREE.Mesh
        const orig = src[i].userData.orig as THREE.Material | undefined
        if (mesh.isMesh && orig) mesh.material = orig
        o.userData = o.userData?.partId ? { partId: o.userData.partId } : {}
      })
      strip.forEach((o) => o.removeFromParent())
      const exporter = new GLTFExporter()
      return (await exporter.parseAsync(clone, { binary: true, onlyVisible: true, maxTextureSize: 2048 })) as ArrayBuffer
    },
  }
  return () => {
    delete window.__atelier
  }
}
