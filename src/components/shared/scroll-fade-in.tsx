
"use client";

import React, { useRef, type ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: `delay-${number}`; // Tailwind delay classes like 'delay-100', 'delay-200'
  duration?: `duration-${number}`; // Tailwind duration classes
  threshold?: number;
  once?: boolean; // Trigger animation only once
  translateY?: `translate-y-${number | string}`; // Tailwind translate-y class
}

export function ScrollFadeIn({
  children,
  className,
  delay = '',
  duration = 'duration-700',
  threshold = 0.1,
  once = true,
  translateY = 'translate-y-5',
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, { threshold, freezeOnceVisible: once });
  const isVisible = !!entry?.isIntersecting;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out transform',
        duration,
        delay,
        isVisible ? 'opacity-100 translate-y-0' : `opacity-0 ${translateY}`,
        className
      )}
    >
      {children}
    </div>
  );
}
