'use client';

import { useEffect, useRef, type RefObject } from 'react';

/** Вызывает `handler` при нажатии (pointerdown) вне всех переданных элементов. */
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  handler: (event: PointerEvent) => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (event: PointerEvent) => {
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const target = event.target as Node;
      if (list.some((ref) => ref.current?.contains(target))) return;
      handlerRef.current(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [enabled]);
}
