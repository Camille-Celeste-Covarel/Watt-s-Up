import { useEffect, useState } from "react";
import "./ScrollToTopButton.css";
import type { ScrollToTopButtonProps } from "../../types/components/componentsTypes";

const ScrollToTopButton = ({ targetRef }: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targetElement = targetRef?.current;
    const listenerTarget = targetElement ?? window;

    const handleScroll = () => {
      const scrollTop = targetElement
        ? targetElement.scrollTop
        : window.scrollY;

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (listenerTarget) {
      listenerTarget.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }

    return () => {
      if (listenerTarget) {
        listenerTarget.removeEventListener("scroll", handleScroll);
      }
    };
  }, [targetRef]);

  const scrollToTop = () => {
    const scrollableElement = targetRef?.current ?? window;
    scrollableElement.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const buttonClass = `scroll-to-top-button ${isVisible ? "visible" : ""} ${
    targetRef ? "in-container" : ""
  }`;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      className={buttonClass}
      aria-label="Retour en haut de la page"
      title="Retour en haut"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="chevron-up"
        className="svg-inline--fa fa-chevron-up fa-w-10"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
      >
        <path
          fill="currentColor"
          d="M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.1 96.1c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.4 24.6-9.4 33.9 0z"
        />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
