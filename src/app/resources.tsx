import { useState } from 'react';
import {
  ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View,
} from 'react-native';
import { useApi } from '../hooks/use-api';

type Resource = {
  name: string;
  description: string;
  url: string;
};

type Theme = {
  bg: string;
  cardBg: string;
  inputBg: string;
  border: string;
  text: string;
  subText: string;
  link: string;
};

function openExternalUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

function ResourceDropdownCard({
  resource,
  theme,
}: {
  resource: Resource;
  theme: Theme;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      style={[
        styles.resourceBox,
        { backgroundColor: theme.inputBg, borderColor: theme.border },
      ]}
    >
      <Pressable
        style={styles.resourceHeader}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Text style={[styles.resourceTitle, { color: theme.text }]}>
          {resource.name}
        </Text>
        <Text style={[styles.dropdownArrow, { color: theme.subText }]}>
          {expanded ? '▲' : '▼'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.resourceContent}>
          <Text style={[styles.descriptionText, { color: theme.subText }]}>
            {resource.description}
          </Text>
          <Pressable
            onPress={() => openExternalUrl(resource.url)}
            style={({ pressed }) => [
              styles.linkButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.linkText, { color: theme.link }]}>
              Visit Website →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ResourcesScreen() {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const theme: Theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    inputBg: isDark ? '#1E1E22' : '#FFFFFF',
    border: isDark ? '#2E2E34' : '#D4D4D8',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
    link: isDark ? '#60A5FA' : '#2563EB',
  };

  const { data, loading, error, reload } = useApi<{
    resources: Resource[];
    disclaimer: string;
  }>('/api/resources');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>
          Helpful Resources & Where I got the Icons
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.subText }]}>
          Trusted advocacy groups and research organizations for further reading.
        </Text>

        {loading && <ActivityIndicator color={theme.link} />}

        {error && (
          <View style={[styles.statusBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.statusText, { color: theme.text }]}>
              Couldn't load resources. Make sure the API is running. ({error})
            </Text>
            <Pressable onPress={reload}>
              <Text style={[styles.retryText, { color: theme.link }]}>Try again</Text>
            </Pressable>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          {data?.resources.map((resource) => (
            <ResourceDropdownCard
              key={resource.name}
              resource={resource}
              theme={theme}
            />
          ))}
        </View>

        <View
          style={[
            styles.disclaimerBox,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.disclaimerText, { color: theme.subText }]}>
            {data?.disclaimer}
          </Text>
        </View>
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
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 720,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  section: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  resourceBox: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  resourceContent: {
    marginTop: 10,
    gap: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  disclaimerBox: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});