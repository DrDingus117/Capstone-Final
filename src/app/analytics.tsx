import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import { useApi } from '../hooks/use-api';

type Count = { label: string; count: number };

type Summary = {
  totalTopics: number;
  totalResources: number;
  totalCenters: number;
  categories: number;
  averageWordsPerTopic: number;
  topicsWithSources: number;
};

type Theme = {
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  subText: string;
  link: string;
  bar: string;
  track: string;
};

// A simple horizontal bar chart built from plain Views (no extra libraries).
function BarChart({ title, data, theme }: { title: string; data: Count[]; theme: Theme }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      {data.length === 0 ? (
        <Text style={[styles.empty, { color: theme.subText }]}>No data yet.</Text>
      ) : (
        data.map((d) => (
          <View key={d.label} style={styles.barRow}>
            <View style={styles.barLabelRow}>
              <Text style={[styles.barLabel, { color: theme.text }]} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={[styles.barValue, { color: theme.subText }]}>{d.count}</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.track }]}>
              <View
                style={[
                  styles.barFill,
                  { backgroundColor: theme.bar, width: `${(d.count / max) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function StatCard({ label, value, theme }: { label: string; value: number; theme: Theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.link }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.subText }]}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme: Theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    link: isDark ? '#60A5FA' : '#2563EB',
    bar: isDark ? '#60A5FA' : '#2563EB',
    track: isDark ? '#1E1E22' : '#E4E4E7',
  };

  const summary = useApi<Summary>('/api/analytics/summary');
  const byCategory = useApi<Count[]>('/api/analytics/topics-by-category');
  const byCity = useApi<Count[]>('/api/analytics/centers-by-city');
  const services = useApi<Count[]>('/api/analytics/services');

  const loading = summary.loading || byCategory.loading || byCity.loading || services.loading;
  const error = summary.error || byCategory.error || byCity.error || services.error;

  const reloadAll = () => {
    summary.reload();
    byCategory.reload();
    byCity.reload();
    services.reload();
  };

  const s = summary.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>App Data & Analytics</Text>
        <Text style={[styles.pageSubtitle, { color: theme.subText }]}>
          Live numbers calculated by the API from the app's own data.
        </Text>

        {loading && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Couldn't load analytics. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reloadAll}>
              <Text style={[styles.retry, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {s && (
          <View style={styles.statGrid}>
            <StatCard label="Glossary topics" value={s.totalTopics} theme={theme} />
            <StatCard label="Resources" value={s.totalResources} theme={theme} />
            <StatCard label="Autism centers" value={s.totalCenters} theme={theme} />
            <StatCard label="Topic categories" value={s.categories} theme={theme} />
            <StatCard label="Avg. words per topic" value={s.averageWordsPerTopic} theme={theme} />
            <StatCard label="Topics with sources" value={s.topicsWithSources} theme={theme} />
          </View>
        )}

        {byCategory.data && (
          <BarChart title="Topics by category" data={byCategory.data} theme={theme} />
        )}
        {byCity.data && (
          <BarChart title="Autism centers by city" data={byCity.data} theme={theme} />
        )}
        {services.data && (
          <BarChart title="Services offered across centers" data={services.data} theme={theme} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainWrapper: { width: '100%', maxWidth: 720, gap: 16 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  pageSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 130,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 30, fontWeight: '800' },
  statLabel: { fontSize: 13, textAlign: 'center' },
  card: { width: '100%', padding: 16, borderRadius: 10, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  empty: { fontSize: 14 },
  retry: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  barRow: { gap: 4 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  barLabel: { fontSize: 14, flex: 1 },
  barValue: { fontSize: 14, fontWeight: '600' },
  barTrack: { height: 10, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 999 },
});