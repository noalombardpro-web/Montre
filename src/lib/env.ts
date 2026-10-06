const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()

/** Mode « poster » : rendu sans interface, heure figée à 10:08:37 (génération de l'image de façade). */
export const POSTER_MODE = params.has('poster')

/** `?source=glb` : charge les GLB optimisés de public/models/ au lieu des modèles procéduraux. */
export const GLB_SOURCE = params.get('source') === 'glb'
