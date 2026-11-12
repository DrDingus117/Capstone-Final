import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export default function About() {
  return (
    <View style={styles.page}>
      <Text style={styles.text}>About (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24, backgroundColor: colors.background },
  text: { fontSize: 20, color: colors.text },
});