import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

type Client = {
  id: number;
  nom: string;
  latitude: string;
  longitude: string;
  zone: string;
  quartier: string;
  idagence: number;
  idcategorie: number;
  status_qrcode: boolean;
};

export default function Clients() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getBadgeStyle = (status: boolean) => ({
  ...styles.badge,
  backgroundColor: status ? '#2ecc71' : '#e74c3c',
});

  const fetchClients = async () => {
    try {
      const res = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/clients'
      );

      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('CLIENTS ERROR:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/clientDetails',
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.name}>{item.nom}</Text>

      <Text style={styles.text}>
        📍 {item.zone} - {item.quartier}
      </Text>

      <Text style={styles.text}>
        🌍 {item.latitude}, {item.longitude}
      </Text>

        {/* <View
        style={[
            styles.badge,
            { backgroundColor: item.status_qrcode ? '#2ecc71' : '#e74c3c' },
        ]}
        >
        <Text style={{ color: '#fff', fontSize: 12 }}>
            {item.status_qrcode ? 'QR Activé' : 'QR Désactivé'}
        </Text>
        </View> */}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liste des clients</Text>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  text: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },

badge: {
  marginTop: 8,
  alignSelf: 'flex-start',
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 6,
},
});