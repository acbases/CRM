import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NewCorrespondant from './components/newCorrespondant';
import NewFournisseur from './components/newFournisseur';
import EditCorrespondant from './components/editCorrespondant';

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
  agence?: {
    id: number;
    intitule: string;
  };
  categorie_client?: {
    id: number;
    intitule: string;
  };
};



export default function ClientDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [correspondants, setCorrespondants] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [showCorrespondant, setShowCorrespondant] = useState(false);
  const [showFournisseur, setShowFournisseur] = useState(false);
  const [selectedCorrespondant, setSelectedCorrespondant] = useState<any>(null);
  const [editVisible, setEditVisible] = useState(false);
const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchFournisseurs = async () => {
    try {
        const res = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/fournisseurClientByIdClient/${id}`
        );

        const data = await res.json();

        setFournisseurs(Array.isArray(data) ? data : []);
    } catch (err) {
        console.log('FOURNISSEURS ERROR:', err);
    }
    };

  const fetchClient = async () => {
    try {
      const res = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/client/${id}`
      );

      const data = await res.json();
      setClient(data);
    } catch (err) {
      console.log('CLIENT ERROR:', err);
      Alert.alert('Erreur', 'Impossible de charger le client');
    } finally {
      setLoading(false);
    }
  };
  const fetchCorrespondants = async () => {
  try {
    const res = await fetch(
      `https://allapps.alphaciment.com/crm_back/api/correspondantClientByIdClient/${id}`
    );

    const data = await res.json();

    setCorrespondants(Array.isArray(data) ? data : []);
  } catch (err) {
    console.log('CORRESPONDANTS ERROR:', err);
  }
};

  useEffect(() => {
    fetchClient();
    fetchCorrespondants();
    fetchFournisseurs();
  }, [id]);



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.center}>
        <Text>Client introuvable</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{client.nom}</Text>

        <Text style={styles.text}>📍 Zone: {client.zone}</Text>
        <Text style={styles.text}>🏘️ Quartier: {client.quartier}</Text>

        <Text style={styles.text}>
          🏢 Agence: {client.agence?.intitule || '—'}
        </Text>

        <Text style={styles.text}>
          🏷️ Catégorie: {client.categorie_client?.intitule || '—'}
        </Text>

        <Text style={styles.text}>
          🌍 Latitude: {client.latitude}
        </Text>

        <Text style={styles.text}>
          🌍 Longitude: {client.longitude}
        </Text>

        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: client.status_qrcode
                  ? '#2ecc71'
                  : '#e74c3c',
              },
            ]}
          >
            {client.status_qrcode ? 'QR ACTIVÉ' : 'QR DÉSACTIVÉ'}
          </Text>
        </View>

        
        <View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>👥 Correspondants</Text>

<TouchableOpacity
  style={styles.addButton}
  onPress={() => setShowCorrespondant(true)}
>
  <Text style={styles.addButtonText}>+</Text>
</TouchableOpacity>
</View>

{correspondants.length === 0 ? (
  <Text style={styles.empty}>Aucun correspondant</Text>
) : (
  correspondants.map((item) => (
    <View key={item.id} style={styles.itemCard}>
      <Text style={styles.itemText}>
        👤 {item.correspondant?.nom}
      </Text>

      <Text style={styles.subText}>
        💼 {item.correspondant?.poste}
      </Text>

      <Text style={styles.subText}>
        📞 {item.correspondant?.contact}
      </Text>
        {/* EDIT BUTTON */}
         <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
            setSelectedId(item.correspondant?.id);
            setEditVisible(true);
            }}
        >
            <Text style={styles.editButtonText}>✏️ Modifier</Text>
        </TouchableOpacity>
    </View>
  ))
)}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>📦 Fournisseurs</Text>

<TouchableOpacity
  style={styles.addButton}
  onPress={() => setShowFournisseur(true)}
>
  <Text style={styles.addButtonText}>+</Text>
</TouchableOpacity>
</View>

{fournisseurs.length === 0 ? (
  <Text style={styles.empty}>Aucun fournisseur</Text>
) : (
  fournisseurs.map((item) => (
    <View key={item.id} style={styles.itemCard}>
      <Text style={styles.itemText}>
        🏭 {item.fournisseur?.nom || 'Sans nom'}
        
      </Text>
      {/* EDIT BUTTON */}
        <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
            setSelectedCorrespondant(item);
            setShowCorrespondant(true);
            }}
        >
            <Text style={styles.editButtonText}>✏️ Modifier</Text>
        </TouchableOpacity>
    </View>
  ))
)}

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#333' }}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <NewCorrespondant
  visible={showCorrespondant}
  idclient={client?.id ?? null}
  onClose={() => setShowCorrespondant(false)}
  onSave={async () => {
    setShowCorrespondant(false);

    try {
      const response = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/correspondantClientByIdClient/${client?.id}`
      );

      const json = await response.json();

      setCorrespondants(Array.isArray(json) ? json : []);
    } catch (err) {
      console.log('REFRESH CORRESPONDANTS ERROR:', err);
    }
  }}
/>
      <NewFournisseur
  visible={showFournisseur}
  idclient={client?.id ?? null}
  onClose={() => setShowFournisseur(false)}
  onSave={async () => {
    setShowFournisseur(false);

    try {
      const response = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/fournisseurClientByIdClient/${client?.id}`
      );

      const json = await response.json();

      setFournisseurs(Array.isArray(json) ? json : []);
    } catch (err) {
      console.log('REFRESH FOURNISSEURS ERROR:', err);
    }
  }}
/>
<EditCorrespondant
  visible={editVisible}
  idcorrespondant={selectedId}
  onClose={() => setEditVisible(false)}
  onSave={fetchCorrespondants}
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  text: {
    fontSize: 14,
    marginTop: 6,
    color: '#333',
  },

  badgeContainer: {
    marginTop: 15,
  },

  badge: {
    alignSelf: 'flex-start',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: 'bold',
  },

  mapBtn: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButton: {
  marginTop: 8,
  alignSelf: 'flex-end',
  backgroundColor: '#f3f4f6',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
},

editButtonText: {
  fontSize: 12,
  color: '#111827',
  fontWeight: '600',
},

  backBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  sectionTitle: {
  marginTop: 20,
  fontSize: 16,
  fontWeight: 'bold',
  color: '#d71f27',
},

itemCard: {
  backgroundColor: '#f9fafb',
  padding: 12,
  borderRadius: 10,
  marginTop: 8,
},

itemText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111827',
},

subText: {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 2,
},

empty: {
  fontSize: 13,
  color: '#9ca3af',
  marginTop: 5,
},
sectionHeader: {
  marginTop: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

addButton: {
  backgroundColor: '#d71f27',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},

addButtonText: {
  color: '#fff',
  fontSize: 22,
  fontWeight: 'bold',
  lineHeight: 24,
},
});