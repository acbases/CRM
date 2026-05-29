import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface Rapport {
  id: number;
  idvisite: number;
  description: string;
  action_a_faire: string | null;
  sary: string | null;
  prochaine_visite: string | null;
  idcorrespondant: number;

  visite: {
    id: number;
    idclient: number;
    idutilisateur: number;
    idcategorie: number;
    date: string;
    statut: number;
    type: number;
    idtype: number | null;
    created_at: string | null;
    updated_at: string | null;
    object: string | null;
  };

  correspondant: {
    id: number;
    nom: string;
    poste: string;
    contact: string;
  };
}

// interface Rapport {
//   id: number;
//   description: string;
//   actionAFaire: string;
//   photo: string | null;
//   prochainRendezVous: string;
//   idvisite: number;
// }

interface Visite{
  id: number;

  idclient: number;
  idutilisateur: number;
  idcategorie: number;
  idtype: number | null;

  date: string; // "2026-04-16 00:00:00"

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
}

interface Client {
  id: number;

  nom: string;

  latitude: string;
  longitude: string;

  zone: string;
  quartier: string;

  idagence: number;
  idcategorie: number;

  agence: {
    id: number;
    intitule: string;
    region: string | null;
  };

  categorie_client: {
    id: number;
    intitule: string;
  };
}

export default function ResultB2B() {
  const { idVisite } = useLocalSearchParams();
//   const [data, setData] = useState<Rapport | null>(null);
  const [clients, setClients] = useState<Client | null>(null);
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [visite, setVisite] = useState<Visite | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);

  fetch(`https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`)
    .then(res => res.json())
    .then(json => setVisite(json))
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
    console.log('VISITE INFO:', visite);
}, [idVisite]);


useEffect(() => {
  if (!visite?.idclient) return;

  setLoading(true);

  fetch(`https://allapps.alphaciment.com/crm_back/api/client/${visite.idclient}`)
    .then(res => res.json())
    .then(json => setClients(json))
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
    console.log('CLIENT INFO:', clients);
}, [visite]);



useEffect(() => {
  setLoading(true);

  fetch(`https://allapps.alphaciment.com/crm_back/api/getRapportB2BByIdVisite/${idVisite}`)
    .then(res => res.json())
    .then(json => setRapport(Array.isArray(json) ? json[0] : json))
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
    console.log('RAPPORT B2B:', rapport);

}, [idVisite]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!rapport) {
    return (
      <View style={styles.center}>
        <Text>Aucun rapport trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      {/* VISITE INFO */}
      <View style={styles.card}>
        <Text style={styles.title}>Informations visite</Text>

        <Text>Client : {clients?.nom || 'Inconnu'}</Text>
        <Text>Zone : {clients?.zone || 'Inconnue'}</Text>
        <Text>Quartier : {clients?.quartier || 'Inconnu'}</Text>
        <Text>Agence : {clients?.agence.intitule || 'Inconnue'}</Text>
        <Text>Catégorie : {clients?.categorie_client.intitule}</Text>
        <Text>Date visite : {visite?.date}</Text>
      </View>

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.title}>Description</Text>
        <Text>{rapport?.description}</Text>
      </View>

      {/* ACTION */}
      <View style={styles.card}>
        <Text style={styles.title}>Action à faire</Text>
        <Text>{rapport?.action_a_faire}</Text>
      </View>

      {/* PHOTO */}
      <View style={styles.card}>
        <Text style={styles.title}>Photo</Text>

        {rapport?.sary ? (
          <Image
            source={{ uri: rapport.sary }}
            style={styles.image}
          />
        ) : (
          <Text>Aucune photo</Text>
        )}
      </View>

      {/* RDV */}
      <View style={styles.card}>
        <Text style={styles.title}>Prochain rendez-vous</Text>
        <Text>{rapport?.prochaine_visite}</Text>
      </View>

    </ScrollView>
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
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});