import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// 1. Define the structural type of your autism topic for TypeScript
interface Topic {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
  sources: string[];
}

// 🚀 Use your literal computer IP address here on port 3000
const API_URL = 'http://YOUR_LOCAL_IP_ADDRESS_HERE:3000/api/topics';

export default function HomeScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then((data: Topic[]) => {
        setTopics(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error connecting to backend API:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            Autism Information Portal
          </ThemedText>
        </ThemedView>

        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
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
});
