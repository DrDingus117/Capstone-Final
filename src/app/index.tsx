import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useApi } from '../hooks/use-api';

interface Topic {
  id: number;
  title: string;
  category: string;
  summary: string;
  body: string[];
  sources: string[];
}

export default function HomeScreen() {
  // The API address comes from constants/api.ts, so it works on web and phone.
  const { data: topics, loading, error, reload } = useApi<Topic[]>('/api/topics');
  const router = useRouter();

  // Home shows 3 topics ("What is autism?" first if it exists); the Glossary has them all.
  const all = topics ?? [];
  const isIntro = (t: Topic) => /what is autism/i.test(t.title);
  const featured = [...all.filter(isIntro), ...all.filter((t) => !isIntro(t))].slice(0, 3);

  if (loading && !topics) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* One scrolling page: the title, the cards, and the footer all scroll together */}
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.inner}>
            <ThemedView style={styles.heroSection}>
              <ThemedText type="title" style={styles.title}>
                Autism Information Portal: Explore, Learn, and Understand
              </ThemedText>
            </ThemedView>

            {error && (
              <ThemedView type="backgroundElement" style={styles.messageBox}>
                <ThemedText type="default" style={styles.centerText}>
                  Couldn&apos;t load topics. Make sure the API is running. ({error})
                </ThemedText>
                <Pressable onPress={reload}>
                  <ThemedText type="small" style={styles.linkText}>
                    Try again
                  </ThemedText>
                </Pressable>
              </ThemedView>
            )}

            {featured.map((item) => (
              <ThemedView key={item.id} type="backgroundElement" style={styles.card}>
                <ThemedText type="small" style={styles.categoryBadge}>
                  {item.category.toUpperCase()}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText type="default" style={styles.summary}>
                  {item.summary}
                </ThemedText>
              </ThemedView>
            ))}

            {all.length > featured.length && (
              <ThemedView type="backgroundElement" style={styles.messageBox}>
                <ThemedText type="default" style={styles.centerText}>
                  Showing {featured.length} of {all.length} topics. Open the Glossary tab to read
                  them all.
                </ThemedText>
                <Pressable onPress={() => router.push('/glossary' as any)}>
                  <ThemedText type="small" style={styles.linkText}>
                    Go to Glossary →
                  </ThemedText>
                </Pressable>
              </ThemedView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'web' ? Spacing.four : Spacing.three,
    paddingBottom: 48,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.two,
    // The default title size is huge on a phone, so it's smaller there.
    ...(Platform.OS === 'web' ? {} : { fontSize: 34, lineHeight: 42 }),
  },
  messageBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
  linkText: {
    color: '#0288D1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
    width: '100%',
  },
  categoryBadge: {
    color: '#0288D1',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  summary: {
    opacity: 0.7,
  },
});