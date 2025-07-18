import { type RefObject, useEffect } from "react";

// Le type T est générique pour pouvoir fonctionner avec n'importe quel élément HTML (div, button, etc.)
type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      // On ne fait rien si l'élément cliqué est l'overlay lui-même ou un de ses enfants
      if (!el || el.contains((event.target as Node) || null)) {
        return;
      }
      handler(event); // Appeler le handler (notre closeOverlay)
    };

    // On écoute `mousedown` plutôt que `click` car il se déclenche avant.
    // C'est plus robuste pour éviter des comportements non désirés.
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Nettoyage de l'effet : on retire les écouteurs quand le composant est démonté
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // On ne redéclenche l'effet que si la ref ou le handler changent
};
