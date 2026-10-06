import * as THREE from 'three'

/** Ensemble des matériaux de substitution (pour retrouver l'original). */
export const overrideMaterials = new WeakSet<THREE.Material>()

/** Matériau rayons X : effet Fresnel additif, bords lumineux, cœur transparent. */
export const xrayMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color('#d9b878') },
    uCore: { value: new THREE.Color('#5f8fd6') },
  },
  vertexShader: /* glsl */ `
    varying vec3 vN;
    varying vec3 vV;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      #ifdef USE_INSTANCING
        mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
      #else
        vN = normalize(normalMatrix * normal);
      #endif
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uCore;
    varying vec3 vN;
    varying vec3 vV;
    void main() {
      float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
      f = pow(f, 2.2);
      vec3 col = mix(uCore * 0.25, uColor * 1.4, f);
      gl_FragColor = vec4(col, 0.05 + f * 0.75);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
})
overrideMaterials.add(xrayMaterial)

export const wireMaterial = new THREE.MeshBasicMaterial({
  color: '#c9a96a',
  wireframe: true,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
})
overrideMaterials.add(wireMaterial)

const dimCache = new WeakMap<THREE.Material, Map<number, THREE.Material>>()

/** Variante transparente d'un matériau (pièces non isolées). */
export function dimmed(orig: THREE.Material, opacity: number) {
  let byOpacity = dimCache.get(orig)
  if (!byOpacity) {
    byOpacity = new Map()
    dimCache.set(orig, byOpacity)
  }
  let m = byOpacity.get(opacity)
  if (!m) {
    m = orig.clone()
    m.transparent = true
    m.opacity = opacity
    m.depthWrite = false
    const pm = m as THREE.MeshPhysicalMaterial
    if (pm.transmission) pm.transmission = 0
    // les reflets HDR traversent l'opacité (blending avant tonemapping) : on les atténue aussi
    if (pm.envMapIntensity !== undefined) pm.envMapIntensity = 0.25
    if (pm.emissiveIntensity !== undefined) pm.emissiveIntensity *= opacity
    overrideMaterials.add(m)
    byOpacity.set(opacity, m)
  }
  return m
}
