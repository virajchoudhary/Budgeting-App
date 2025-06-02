
"use client";

import React, { useRef, type ReactNode, type RefObject } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

interface ScrollFadeInProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  delay?: `delay-${number}`;
  duration?: `duration-${number}`;
  threshold?: number;
  once?: boolean;
  translateY?: `translate-y-${number | string}`;
}

export function ScrollFadeIn({
  children,
  asChild,
  className,
  delay = '',
  duration = 'duration-500',
  threshold = 0.1,
  once = true,
  translateY = 'translate-y-4',
}: ScrollFadeInProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const entry = useIntersectionObserver(elementRef as RefObject<Element>, { threshold, freezeOnceVisible: once });
  const isVisible = !!entry?.isIntersecting;

  const Comp = asChild ? Slot : 'div';

  const animationClasses = cn(
    'transition-all ease-out transform',
    duration,
    delay,
    isVisible ? 'opacity-100 translate-y-0' : `opacity-0 ${translateY}`
  );

  return (
    <Comp
      ref={elementRef as any} // Type 'any' for ref when Comp can be Slot or 'div'
      className={cn(animationClasses, className)}
    >
      {children}
    </Comp>
  );
}
