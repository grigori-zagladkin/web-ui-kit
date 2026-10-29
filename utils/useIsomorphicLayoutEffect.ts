import { useEffect, useLayoutEffect } from 'react';
import { isBrowser } from './dom';

/** useLayoutEffect в браузере и useEffect на сервере — без предупреждений при SSR. */
export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
