import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApi } from '../hooks/use-api';
import { useColorScheme } from '../hooks/use-color-scheme';

type Topic = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string[];
  sources: string[];
};

type Theme = {
  bg: string;
  cardBg: string;
  inputBg: string;
  border: string;
  text: string;
  subText: string;
  badgeBg: string;
  link: string;
};

function TopicDropdownCard({ topic, theme }: { topic: Topic; theme: Theme }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
      <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
        <Text style={[styles.badgeText, { color: theme.link }]}>
          {topic.category}
        </Text>
      </View>

      <Text style={[styles.topicTitle, { color: theme.text }]}>
        {topic.title}
      </Text>
      <Text style={[styles.topicSummary, { color: theme.subText }]}>
        {topic.summary}
      </Text>

      <Pressable
        style={[
          styles.dropdownHeader,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Text style={[styles.dropdownHeaderText, { color: theme.text }]}>
          {expanded ? 'Hide Details' : 'Read Full Topic'}
        </Text>
        <Text style={[styles.dropdownArrow, { color: theme.subText }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.dropdownBody,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          {topic.body.map((paragraph, index) => (
            <Text
              key={`${topic.id}-p-${index}`}
              style={[styles.paragraphText, { color: theme.text }]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default function Glossary() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme: Theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    inputBg: isDark ? '#1E1E22' : '#FFFFFF',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    badgeBg: isDark ? '#1E293B' : '#DBEAFE',
    link: isDark ? '#60A5FA' : '#2563EB',
  };

  const { data: topics, loading, error, reload } = useApi<Topic[]>('/api/topics');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>
          Topics & Experiences
        </Text>

        {loading && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load topics. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {topics?.map((topic) => (
          <TopicDropdownCard key={topic.id} topic={topic} theme={theme} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  scrollContainer: {
    alignItems: 'center', // centers mainWrapper horizontally
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 720,
    gap: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  topicSummary: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  dropdownHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownBody: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  paragraphText: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'left',
  },
});
