const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()

/** Mode « poster » : rendu sans interface, heure figée à 10:08:37 (génération de l'image de façade). */
export const POSTER_MODE = params.has('poster')

/** `?source=glb` : charge les GLB optimisés de public/models/ au lieu des modèles procéduraux. */
export const GLB_SOURCE = params.get('source') === 'glb'

/** `?thumb` : rendu d'une vignette 3D à fond transparent (scripts/make-thumbs.mjs). */
export const THUMB_MODE = params.has('thumb')
/** Sans interface : poster et vignettes. */
export const CLEAN = POSTER_MODE || THUMB_MODE
