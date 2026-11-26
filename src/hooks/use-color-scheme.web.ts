// Web version. The server that pre-renders the page can't know if you use dark
// mode, so it always draws the light version. This waits until the page has
// loaded in the browser before switching, so the server HTML and the browser
// agree and React doesn't report a hydration mismatch.
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
