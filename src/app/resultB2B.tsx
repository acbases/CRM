import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity,Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../config/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PageHeader from '@/components/PageHeader';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  border: '#E5E7EB',
};

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
  const [users, setUsers] = useState<any>(null);
  const [photoVisible, setPhotoVisible] = useState(false);

useEffect(() => {
  setLoading(true);

  fetch(`${BASE_URL}/visite/${idVisite}`)
    .then(res => res.json())
    .then(json => setVisite(json))
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
    console.log('VISITE INFO:', visite);
}, [idVisite]);


useEffect(() => {
  if (!visite?.idclient) return;

  setLoading(true);

  fetch(`${BASE_URL}/client/${visite.idclient}`)
    .then(res => res.json())
    .then(json => setClients(json))
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
    console.log('CLIENT INFO:', clients);
}, [visite]);

  useEffect(() => {
    if (!visite?.idutilisateur) return;
  
    setLoading(true);
  
    fetch(`${BASE_URL}/user/${visite.idutilisateur}`)
      .then(res => res.json())
      .then(json => setUsers(json))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
      console.log('User INFO:', users);
  }, [visite]);

useEffect(() => {
  setLoading(true);

  fetch(`${BASE_URL}/getRapportB2BByIdVisite/${idVisite}`)
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
  <View style={styles.safe}>
    <PageHeader title="Résultat rapport B2B" />

    <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Informations client */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations du client</Text>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{clients?.nom || 'Inconnu'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Localisation</Text>
            <Text style={styles.infoValue}>
              {clients?.zone || '—'} • {clients?.quartier || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="briefcase-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Agence</Text>
            <Text style={styles.infoValue}>
              {clients?.agence?.intitule || 'Inconnue'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Catégorie client</Text>
            <Text style={styles.infoValue}>
              {clients?.categorie_client?.intitule || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date de visite</Text>
            <Text style={styles.infoValue}>
              {visite?.date
                ? new Date(visite.date).toLocaleDateString('fr-FR')
                : '—'}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Type de visite</Text>
            <Text style={styles.infoValue}>
              {visite?.categorie_visite?.intitule || '—'}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={C.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Commerciale</Text>
            <Text style={styles.infoValue}>
              {users?.name || '-'} {users?.firstname || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Correspondant */}
      {rapport?.correspondant && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Correspondant</Text>

          <Text style={styles.correspondantName}>
            {rapport.correspondant.nom}
          </Text>

          <Text style={styles.correspondantInfo}>
            {rapport.correspondant.poste}
          </Text>

          <Text style={styles.correspondantInfo}>
            {rapport.correspondant.contact}
          </Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {rapport.description || 'Aucune description'}
        </Text>
      </View>

      {/* Action */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Action à faire</Text>
        <Text style={styles.description}>
          {rapport.action_a_faire || 'Aucune action prévue'}
        </Text>
      </View>

      {/* Photo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Photo</Text>

        {rapport.sary ? (
          <TouchableOpacity onPress={() => setPhotoVisible(true)}>
            <Image source={{ uri: rapport.sary }} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyPhoto}>
            <Ionicons name="image-outline" size={40} color={C.grey} />
            <Text style={styles.emptyText}>Aucune photo</Text>
          </View>
        )}
      </View>

      {/* Rendez-vous */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>

        <Text style={styles.rdvText}>
          {rapport.prochaine_visite
            ? new Date(rapport.prochaine_visite).toLocaleDateString('fr-FR')
            : 'Aucun rendez-vous prévu'}
        </Text>
      </View>
    </KeyboardAwareScrollView>
    <Modal
      visible={photoVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPhotoVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setPhotoVisible(false)}
          activeOpacity={1}
        >
          <Image
            source={{ uri: rapport.sary ?? undefined }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  </View>
);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.lightBg,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  infoContent: {
    marginLeft: 12,
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: C.grey,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    color: C.dark,
    fontWeight: '500',
  },

  correspondantName: {
    fontSize: 17,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 6,
  },

  correspondantInfo: {
    fontSize: 14,
    color: C.grey,
    marginBottom: 4,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: C.dark,
  },

  image: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    resizeMode: 'cover',
  },

  emptyPhoto: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 8,
    color: C.grey,
    fontSize: 14,
  },

  rdvText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.primary,
  },
  modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalBackground: {
  flex: 1,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},

fullImage: {
  width: '95%',
  height: '80%',
},
});