import {ComponentPropsWithoutRef, ReactNode} from "react";
import {useIntersection} from "@/hooks/use-intersection";

interface LazyContainerProps extends ComponentPropsWithoutRef<"div"> {
  placeholder?: ReactNode;
  rootMargin?: string;
}

export const LazyContainer = ({
  children,
  placeholder = null,
  rootMargin = "100px", // puedes permitir override
  role = "presentation",
  ...props
}: Readonly<LazyContainerProps>) => {
  const {ref: containerRef, isIntersecting} = useIntersection<HTMLDivElement>({
    rootMargin,
    once: true,
  });
  
  return (
    <div ref={containerRef} {...props} role={role}>
      {isIntersecting ? children : placeholder}
    </div>
  );
};

LazyContainer.displayName = "LazyContainer";
