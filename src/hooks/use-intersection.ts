import {useEffect, useRef, useState} from "react";

export interface UseIntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
}
export function useIntersection<T extends HTMLElement>(options?: UseIntersectionOptions) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (options?.once && entry.isIntersecting) observer.disconnect();
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);
  
  return {ref, isIntersecting};
}