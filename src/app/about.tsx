import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function MultiSectionTemplate() {
  const isDark = useColorScheme() === 'dark';

  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    cardBg: isDark ? '#121212' : '#F4F4F5',
    text: isDark ? '#FFFFFF' : '#000000',
    subText: isDark ? '#A1A1AA' : '#52525B',
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.mainWrapper}>
        {/* Section 1: Hero / Intro */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.title, { color: theme.text }]}>Where you can reach me</Text>
          <Text style={[styles.body, { color: theme.subText }]}>
            Personal: marcuspendleton100@gmail.com school: mpendleton@batestech.edu (I prefer Gmail because I check it more often)
          </Text>
        </View>

        {/* Section 2: Details */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.heading, { color: theme.text }]}>About the Web/Mobile app</Text>
          <Text style={[styles.body, { color: theme.subText }]}>
            This app was created to help teach what autism is and the different details. My current plan is to get the Glossary working with drop downs and this about page looking nice 
          </Text>
        </View>

        {/* Section 3: Footer / Extra */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.heading, { color: theme.text }]}>Resources</Text>
          <Text style={[styles.body, { color: theme.subText }]}>
            Open Book free icon (Glossary) 
            Info free icon (About)
            Maps And Flags free icon (Resources)
            Links will be in content.json (if i can get it working)


          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,              // Centers sections vertically if content is shorter than the screen
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 700,            // Prevents sections from stretching too wide on desktop
    gap: 20,                  // Even spacing between every section
  },
  section: {
    width: '100%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',     // Centers content inside each section
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
