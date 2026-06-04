/**
 * @file useDisclosure.ts
 * Controls the open/closed state of sheets, dialogs, and drawers.
 * The `setOpen` escape-hatch allows bridging with external state drivers
 * (e.g. deep-link navigation that must open a bottom-sheet on mount).
 */
import { useState, useCallback } from 'react';

export interface UseDisclosureReturn {
  /** Whether the element is currently open. */
  readonly isOpen: boolean;
  /** Open the element. No-op when already open. */
  readonly open: () => void;
  /** Close the element. No-op when already closed. */
  readonly close: () => void;
  /** Toggle the current state. */
  readonly toggle: () => void;
  /** Directly set the open state — useful for keyboard/gesture bridges. */
  readonly setOpen: (value: boolean) => void;
}

export interface UseDisclosureOptions {
  /** Initial open state (default: false). */
  readonly defaultOpen?: boolean;
  /** Called after the state transitions to open. */
  readonly onOpen?: () => void;
  /** Called after the state transitions to closed. */
  readonly onClose?: () => void;
}

/**
 * Headless hook for controlling open/closed state of overlays.
 *
 * @example
 * const { isOpen, open, close } = useDisclosure();
 * // <Button onPress={open} /> <Modal visible={isOpen} onDismiss={close} />
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const { defaultOpen = false, onOpen, onClose } = options;

  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const open = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) return prev;
      onOpen?.();
      return true;
    });
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) return prev;
      onClose?.();
      return false;
    });
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        onOpen?.();
      } else {
        onClose?.();
      }
      return next;
    });
  }, [onOpen, onClose]);

  const setOpen = useCallback(
    (value: boolean) => {
      setIsOpen((prev) => {
        if (prev === value) return prev;
        if (value) {
          onOpen?.();
        } else {
          onClose?.();
        }
        return value;
      });
    },
    [onOpen, onClose],
  );

  return { isOpen, open, close, toggle, setOpen };
}
