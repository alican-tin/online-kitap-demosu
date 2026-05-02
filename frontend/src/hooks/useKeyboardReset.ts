import { useEffect } from 'react';

type KeyboardResetOptions = {
  enabled: boolean;
  onReset: () => void;
};

export function useKeyboardReset({ enabled, onReset }: KeyboardResetOptions) {
  useEffect(() => {
    if (!enabled) return;

    const options = { capture: true } as const;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return;
      if (event.key.toLowerCase() !== 'r') return;
      event.preventDefault();
      event.stopPropagation();
      onReset();
    };

    window.addEventListener('keydown', onKeyDown, options);
    return () => window.removeEventListener('keydown', onKeyDown, options);
  }, [enabled, onReset]);
}
