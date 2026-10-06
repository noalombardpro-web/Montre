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
      const root = window.__atelier!.scene!.getObjectByName(`watch-${useAtelier.getState().watchId}`)
      if (!root) throw new Error('watch not found')
      const clone = root.clone(true)
      clone.traverse((o) => {
        // rétablit les matériaux d'origine et retire les objets HTML
        const mesh = o as THREE.Mesh
        if (mesh.isMesh && mesh.userData.orig) mesh.material = mesh.userData.orig
        o.userData = { partId: o.userData?.partId }
      })
      const exporter = new GLTFExporter()
      return (await exporter.parseAsync(clone, { binary: true, onlyVisible: true, maxTextureSize: 2048 })) as ArrayBuffer
    },
  }
  return () => {
    delete window.__atelier
  }
}
