
"use client";

import type { RefObject } from 'react';
import { useEffect, useState, useRef } from 'react';

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: Args = {} // Provide default for the whole options object
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current; 
    
    if (!node) return; // Exit if no node to observe

    // Disconnect previous observer if it exists and is observing a different node or options change
    if (observerRef.current) {
        observerRef.current.disconnect();
    }

    if (frozen) { // If frozen, ensure observer is disconnected and do not re-observe
        if(observerRef.current) observerRef.current.disconnect();
        return;
    }
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(node);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  // Ensure dependencies cover all options that might change the observer's behavior
  }, [elementRef, threshold, root, rootMargin, frozen]); 

  return entry;
}
