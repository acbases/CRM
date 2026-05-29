import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';



interface Visite {
  id: number;

  idclient: number;
  idutilisateur: number;
  idcategorie: number;
  idtype: number | null;

  date: string; // "2026-04-17 00:00:00"

  statut: number;
  type: number;

  object: string | null;

  created_at: string | null;
  updated_at: string | null;

  client: {
    id: number;
    nom: string;

    latitude: string;
    longitude: string;

    zone: string;
    quartier: string;

    idagence: number;
    idcategorie: number;

    categorie_client: {
      id: number;
      intitule: string;
    };
  };

  categorie_visite: {
    id: number;
    intitule: string;
  };

  type_visite: {
    id: number;
    nom: string;
  } | null;
}

export default function Planning() {
  const [visites, setVisites] = useState<Visite[]>([]);
  const router = useRouter();
const [page, setPage] = useState(1);
const [loadingMore, setLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);

useEffect(() => {
  fetch('https://allapps.alphaciment.com/crm_back/api/visiteByIdUtilisateur/3')
    .then(res => res.json())
    .then(json => {
      if (Array.isArray(json)) {
        const sorted = [...json].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setVisites(sorted);
      } else {
        setVisites([]);
      }
    })
    .catch(err => console.log(err));
}, []);

  const today = new Date().toISOString().split('T')[0];

  const getColor = (v: Visite) => {
    if (v.statut === 1) return '#2ecc71'; // vert

    if (v.date < today) return '#e74c3c'; // rouge

    if (v.date === today || v.date > today) return '#f39c12'; // orange

    return '#bdc3c7';
  };

  const renderItem = ({ item }: { item: Visite }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        console.log('Visite sélectionnée:', item.id);
        const route =
          item.statut === 0
            ? '/rapportB2B'
            : '/resultB2B';
        router.push({
          pathname: route,
          params: {
            idVisite: item.id.toString(),
          },
        });
      }}
    >
      <View
        style={[
          styles.card,
          { borderLeftColor: getColor(item) },
        ]}
      >
        <Text style={styles.title}>
          {item.client.nom}
        </Text>

        <Text>
          {item.client.categorie_client.intitule}
        </Text>

        <Text>Zone : {item.client.zone}</Text>

        <Text>
          Quartier : {item.client.quartier}
        </Text>

        {/* <Text>
          Utilisateur : {item.client.nom}
        </Text> */}

        <Text>
          Date : {item.date.split(' ')[0]}
        </Text>

        <Text
          style={{
            color: getColor(item),
            fontWeight: 'bold',
          }}
        >
          {item.statut === 1
            ? 'VISITE FAITE'
            : 'EN ATTENTE'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f6fa',
  },
  card: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 6,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});