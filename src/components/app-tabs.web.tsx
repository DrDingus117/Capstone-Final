import { Slot, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const TABS = [
  { label: 'Home', href: '/' },
  { label: 'Glossary', href: '/glossary' },
  { label: 'Resources', href: '/resources' },
  { label: 'Locations', href: '/locations' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'About', href: '/about' },
] as const;

function NavButton({
  label,
  href,
  isFocused,
}: {
  label: string;
  href: string;
  isFocused: boolean;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(href as any)}
      style={[styles.tabButton, isFocused && styles.tabButtonActive]}
    >
      <ThemedText
        type="small"
        style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      {/* Top bar sits above the content, so pages start below it */}
      <ThemedView type="backgroundElement" style={styles.fullTopBar}>
        <View style={styles.tabList}>
          {TABS.map((tab) => (
            <NavButton
              key={tab.href}
              label={tab.label}
              href={tab.href}
              isFocused={pathname === tab.href}
            />
          ))}
        </View>
      </ThemedView>

      {/* Each screen renders here and scrolls inside this bounded area */}
      <View style={styles.slot}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100vh' as any, // pins the app to the window height on web
    overflow: 'hidden', // each screen's ScrollView does the scrolling
  },
  slot: {
    flex: 1,
    minHeight: 0,
  },
  fullTopBar: {
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.25)',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    zIndex: 100,
  },
  tabList: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  tabButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#0288D1',
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
});