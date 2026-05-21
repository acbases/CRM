import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ title = 'Connexion', subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo} />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007bff',
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },
  content: { width: '100%' },
});
