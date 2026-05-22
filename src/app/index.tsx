import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://allapps.alphaciment.com/crm_back/api/clients')
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('Erreur lors du chargement: ' + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Données API</Text>

      <Text style={styles.json}>
        {JSON.stringify(data, null, 2)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  json: {
    fontSize: 16,
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 10,
  },
});