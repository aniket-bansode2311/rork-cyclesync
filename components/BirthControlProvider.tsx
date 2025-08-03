import createContextHook from '@nkzw/create-context-hook';
import { useBirthControl } from '@/hooks/useBirthControl';

export const [BirthControlProvider, useBirthControlContext] = createContextHook(() => {
  return useBirthControl();
});