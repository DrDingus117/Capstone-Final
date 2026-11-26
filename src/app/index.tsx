import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
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
  // The API address now comes from constants/api.ts, so it works on web and phone.
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
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            Autism Information Portal: Explore, Learn, and Understand
          </ThemedText>
        </ThemedView>

        {error && (
          <ThemedView type="backgroundElement" style={styles.errorBox}>
            <ThemedText type="default" style={styles.errorText}>
              Couldn&apos;t load topics. Make sure the API is running. ({error})
            </ThemedText>
            <Pressable onPress={reload}>
              <ThemedText type="small" style={styles.retryText}>
                Try again
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <FlatList
          data={featured}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
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
          )}
          ListFooterComponent={
            all.length > featured.length ? (
              <ThemedView type="backgroundElement" style={styles.moreBox}>
                <ThemedText type="default" style={styles.moreText}>
                  Showing {featured.length} of {all.length} topics. Open the Glossary tab to read
                  them all.
                </ThemedText>
                <Pressable onPress={() => router.push('/glossary' as any)}>
                  <ThemedText type="small" style={styles.retryText}>
                    Go to Glossary →
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ) : null
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  errorBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorText: {
    textAlign: 'center',
  },
  retryText: {
    color: '#0288D1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
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
  moreBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  moreText: {
    textAlign: 'center',
  },
});