import { StyleSheet, Text, View } from 'react-native';

export default function About() {
  return (
    <View style={styles.page}>
      <Text style={styles.text}>About (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24, backgroundColor: 'white' },
  text: { fontSize: 20, color: 'black' },
});