import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';



interface Visite {
  id: number;
  nomClient: string;
  categorieClient: string;
  zone: string;
  quartier: string;
  nomUtilisateur: string;
  dateVisite: string; // format: YYYY-MM-DD
  statut: 'FAIT' | 'NON_FAIT';
}

const mockVisites : Visite[] = [
  {
    id: 1,
    nomClient: "Entreprise Rasoanaivo",
    categorieClient: "VIP",
    zone: "Centre Ville",
    quartier: "Analakely",
    nomUtilisateur: "Rakoto",
    dateVisite: "2026-05-20",
    statut: "NON_FAIT",
  },
  {
    id: 2,
    nomClient: "Société Andrianina",
    categorieClient: "Standard",
    zone: "Nord",
    quartier: "Ankorondrano",
    nomUtilisateur: "Rabe",
    dateVisite: "2026-05-22",
    statut: "NON_FAIT",
  },
  {
    id: 3,
    nomClient: "Commerce Tiana",
    categorieClient: "Premium",
    zone: "Sud",
    quartier: "Isoraka",
    nomUtilisateur: "Rasoa",
    dateVisite: "2026-05-23",
    statut: "FAIT",
  },
  {
    id: 4,
    nomClient: "Entreprise Hery",
    categorieClient: "Standard",
    zone: "Est",
    quartier: "Ivandry",
    nomUtilisateur: "Rakoto",
    dateVisite: "2026-05-18",
    statut: "NON_FAIT",
  },
  {
    id: 5,
    nomClient: "Boutique Lova",
    categorieClient: "VIP",
    zone: "Ouest",
    quartier: "67 Ha",
    nomUtilisateur: "Rabe",
    dateVisite: "2026-05-22",
    statut: "FAIT",
  },
];

export default function Planning() {
  const [visites, setVisites] = useState<Visite[]>([]);

  useEffect(() => {
    setVisites(mockVisites);
  }, []);

//   useEffect(() => {
//     fetch('https://allapps.alphaciment.com/crm_back/api/visites')
//       .then(res => res.json())
//       .then(json => setVisites(Array.isArray(json) ? json : []))
//       .catch(err => console.log(err));
//   }, []);

  const today = new Date().toISOString().split('T')[0];

  const getColor = (v: Visite) => {
    if (v.statut === 'FAIT') return '#2ecc71'; // vert

    if (v.dateVisite < today) return '#e74c3c'; // rouge

    if (v.dateVisite === today) return '#f39c12'; // orange

    return '#bdc3c7';
  };

  const renderItem = ({ item }: { item: Visite }) => (
    <View style={[styles.card, { borderLeftColor: getColor(item) }]}>
      <Text style={styles.title}>{item.nomClient}</Text>

      <Text>Catégorie : {item.categorieClient}</Text>
      <Text>Zone : {item.zone}</Text>
      <Text>Quartier : {item.quartier}</Text>
      <Text>Utilisateur : {item.nomUtilisateur}</Text>
      <Text>Date : {item.dateVisite}</Text>

      <Text style={{ color: getColor(item), fontWeight: 'bold' }}>
        {item.statut === 'FAIT' ? 'VISITE FAITE' : 'EN ATTENTE'}
      </Text>
    </View>
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