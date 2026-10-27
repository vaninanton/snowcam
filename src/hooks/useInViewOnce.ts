import { useEffect, useState, type RefObject } from "react";

/**
 * Становится true, когда элемент впервые подходит к видимой области ближе
 * чем на rootMargin, и больше не сбрасывается. Без IntersectionObserver
 * считает элемент видимым сразу — лучше загрузить лишнее, чем ничего.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  rootMargin = "200px",
): boolean {
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (inView || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setInView(true);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, inView, rootMargin]);

  return inView;
}
