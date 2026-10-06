const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()

/** Mode « poster » : rendu sans interface, heure figée à 10:08:37 (génération de l'image de façade). */
export const POSTER_MODE = params.has('poster')
