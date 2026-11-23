import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import CentersMap from '../components/centers-map';
import { Center } from '../components/map-html';
import { useApi } from '../hooks/use-api';

export default function LocationsScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    inputBg: isDark ? '#1E1E22' : '#FFFFFF',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    link: isDark ? '#60A5FA' : '#2563EB',
  };

  const { data: centers, loading, error, reload } = useApi<Center[]>('/api/centers');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Autism Centers Near You</Text>
        <Text style={[styles.pageSubtitle, { color: theme.subText }]}>
          Tap a pin to see a center's address, phone number, and services.
        </Text>

        {loading && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load centers. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        {centers && centers.length > 0 && <CentersMap centers={centers} />}

        {centers?.map((c) => (
          <View
            key={c.id}
            style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>{c.name}</Text>
            <Text style={[styles.cardLine, { color: theme.subText }]}>
              {c.address}, {c.city}, {c.state} {c.zip}
            </Text>
            {c.services && c.services.length > 0 && (
              <Text style={[styles.cardLine, { color: theme.subText }]}>
                Services: {c.services.join(', ')}
              </Text>
            )}
            {c.notes ? (
              <Text style={[styles.cardLine, { color: theme.subText }]}>{c.notes}</Text>
            ) : null}

            <View style={styles.actions}>
              {c.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                  <Text style={[styles.linkText, { color: theme.link }]}>Call {c.phone}</Text>
                </Pressable>
              ) : null}
              {c.website ? (
                <Pressable onPress={() => Linking.openURL(c.website as string)}>
                  <Text style={[styles.linkText, { color: theme.link }]}>Website →</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}
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
  statusBox: { width: '100%', padding: 16, borderRadius: 10, alignItems: 'center', gap: 10 },
  statusText: { fontSize: 15, textAlign: 'center' },
  retryText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  card: { width: '100%', padding: 16, borderRadius: 10, borderWidth: 1, gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardLine: { fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 },
  linkText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
});