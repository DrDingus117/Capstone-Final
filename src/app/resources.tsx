import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function PageTemplate() {
  const isDark = useColorScheme() === 'dark';

  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.bg }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Page Title</Text>
        <Text style={[styles.body, { color: theme.text }]}>
          Your centered content goes here. This works cleanly on both phone screens and wide web browsers.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 600, // Keeps lines readable on desktop while filling phone screens
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
