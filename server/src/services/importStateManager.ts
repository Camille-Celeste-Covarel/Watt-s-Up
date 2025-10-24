/**
 * Gère l'état des importations en cours, notamment les demandes d'annulation.
 * Ce module est un simple gestionnaire d'état en mémoire.
 */

interface ImportState {
  isStopRequested: boolean;
}

const activeImports = new Map<string, ImportState>();

/**
 * Enregistre un nouvel import dans le gestionnaire.
 * @param importId L'UUID de l'import.
 */
export function registerImport(importId: string): void {
  activeImports.set(importId, { isStopRequested: false });
}

/**
 * Demande l'arrêt d'une importation.
 * @param importId L'UUID de l'import à arrêter.
 */
export function requestStop(importId: string): void {
  const state = activeImports.get(importId);
  if (state) {
    state.isStopRequested = true;
  }
}

/**
 * Vérifie si une demande d'arrêt a été faite pour un import.
 * @param importId L'UUID de l'import.
 * @returns `true` si l'arrêt est demandé, sinon `false`.
 */
export function isStopRequested(importId: string): boolean {
  return activeImports.get(importId)?.isStopRequested ?? false;
}

/**
 * Supprime un import du gestionnaire (nettoyage).
 * @param importId L'UUID de l'import.
 */
export function unregisterImport(importId: string): void {
  activeImports.delete(importId);
}
