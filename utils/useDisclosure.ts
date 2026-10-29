'use client';

import { useCallback } from 'react';
import { useControllableState } from './useControllableState';

export interface UseDisclosureOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Открыто/закрыто для диалогов, меню и поповеров. Поддерживает controlled-режим. */
export function useDisclosure({ open, defaultOpen = false, onOpenChange }: UseDisclosureOptions = {}) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen((prev) => !prev), [setOpen]);
  return { isOpen, setOpen, onOpen, onClose, onToggle };
}
