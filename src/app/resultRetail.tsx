import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
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

export default function ResultRetail() {
  const { idVisite } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [rapport, setRapport] = useState<any>(null);
  const [produits, setProduits] = useState<any>(null);
  const [plv, setPlv] = useState<any>(null);
  const [autres, setAutres] = useState<any[]>([]);
  const [visite, setVisite] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!visite?.idclient) return;
  
    setLoading(true);
  
    fetch(`${BASE_URL}/client/${visite.idclient}`)
      .then(res => res.json())
      .then(json => setClient(json))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
      console.log('CLIENT INFO:', client);
  }, [visite]);

  useEffect(() => {
    if (!visite?.idutilisateur) return;
  
    setLoading(true);
  
    fetch(`${BASE_URL}/user/${visite.idutilisateur}`)
      .then(res => res.json())
      .then(json => setUsers(json))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
      console.log('User INFO:', client);
  }, [visite]);

  const loadData = async () => {
    try {

    const responseVisite = await fetch(
        `${BASE_URL}/visite/${idVisite}`
    );
    const visiteJson = await responseVisite.json();
    setVisite(visiteJson);

      const responseRapport = await fetch(
        `${BASE_URL}/getRapportByIdVisite/${idVisite}` //rapport
      );
      const rapportJson = await responseRapport.json();
      setRapport(rapportJson);

      const responseProduits = await fetch(
        `${BASE_URL}/getVueRapportProduitsByIdVisite/${idVisite}` //produits
      );
      const produitsJson = await responseProduits.json();
      setProduits(produitsJson);

      const responsePlv = await fetch(
        `${BASE_URL}/getVueRapportPlvByIdVisite/${idVisite}`  //plv
      );
      const plvJson = await responsePlv.json();
      setPlv(plvJson);

      const responseAutres = await fetch(
        `${BASE_URL}/getVueRapportAutresProduitsByIdVisite/${idVisite}`    //autres produits
      );
      const autresJson = await responseAutres.json();
      setAutres(
        Array.isArray(autresJson)
          ? autresJson
          : autresJson?.data && Array.isArray(autresJson.data)
            ? autresJson.data
            : []
      );


      console.log('RAPPORT:', rapportJson);
      console.log('PRODUITS:', produitsJson);
      console.log('PLV:', plvJson);
      console.log('AUTRES PRODUITS:', autresJson);
      console.log('VISITE:', visiteJson);
      

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!rapport && !produits && !plv && !autres) {
    return (
      <View style={styles.center}>
        <Text>Aucune donnée trouvée</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
    <SafeAreaView style={styles.container}>
      <PageHeader title="Résultat rapport retail" />
      <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={100}
            keyboardShouldPersistTaps="handled"
          >
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations du client</Text>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Client</Text>
              <Text style={styles.infoValue}>{client?.nom || '—'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Localisation</Text>
              <Text style={styles.infoValue}>{client?.zone || '—'} • {client?.quartier || '—'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Agence</Text>
              <Text style={styles.infoValue}>
                {client?.agence?.intitule || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Catégorie</Text>
              <Text style={styles.infoValue}>
                {client?.categorie_client?.intitule || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date visite</Text>
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
              <Text style={styles.infoLabel}>Type visite</Text>
              <Text style={styles.infoValue}>
                {visite?.categorie_visite?.intitule || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={C.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Commercial</Text>
              <Text style={styles.infoValue}>
                {users?.name || '-'} {users?.firstname || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* RAPPORT */}
        <View style={styles.card}>
            
          <Text style={styles.sectionTitle}>
            Commentaire
          </Text>

          <Text>
            {rapport?.[0]?.description || 'Aucun commentaire'}
          </Text>

          
        </View>

        {/* PRODUITS */}
        <Text style={styles.bigSection}>
          Produits relevés
        </Text>

        {produits?.length > 0 ? (
          produits.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <Text style={styles.productTitle}>
                {item?.intitule || '-'}
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix achat</Text>
                <Text style={styles.detailValue}>
                  {item?.prix_achat || '-'} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix vente gros</Text>
                <Text style={styles.detailValue}>
                  {item?.prix_vente_gros || '-'} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix vente détail</Text>
                <Text style={styles.detailValue}>
                  {item?.prix_vente_details || '-'} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coût transport</Text>
                <Text style={styles.detailValue}>
                  {item?.cout_transport || '-'} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marge</Text>
                <Text style={styles.detailValue}>
                  {item?.marge || '-'}
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Volume</Text>
                <Text style={styles.detailValue}>
                  {item?.volume || '-'} T
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Aucun produit relevé</Text>
        )}

        {/* AUTRES PRODUITS */}
        <Text style={styles.bigSection}>
          Autres Produits
        </Text>

        {autres.length > 0 ? (
          autres.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.productTitle}>
                {item.nom}
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix achat</Text>
                <Text style={styles.detailValue}>
                  {item.prix_achat} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix vente gros</Text>
                <Text style={styles.detailValue}>
                  {item.prix_vente_gros} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Prix vente détail</Text>
                <Text style={styles.detailValue}>
                  {item.prix_vente_details} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transport</Text>
                <Text style={styles.detailValue}>
                  {item.cout_transport} Ar
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marge</Text>
                <Text style={styles.detailValue}>
                  {item.marge}
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Volume</Text>
                <Text style={styles.detailValue}>
                  {item.volume} T
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Aucun autre produit</Text>
        )}

        {/* PLV */}
        <Text style={styles.bigSection}>
          PLV présentes
        </Text>

        <View style={styles.card}>
          {plv?.length > 0 ? (
            plv.map((item: any, index: number) => (
              <Text key={index} style={styles.plvItem}>
                ✓ {item.plv_nom}
              </Text>
            ))
          ) : (
            <Text style={styles.empty}>Aucune PLV</Text>
          )}

          <Text style={styles.label}>Autre PLV</Text>

          <Text style={styles.detailValue}>
            {rapport?.[0]?.autre_plv || 'Aucune autre PLV'}
          </Text>
        </View>
      </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
    
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.lightBg,
  },

  container: {
    flex: 1,
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

  clientCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 16,
  },

  bigSection: {
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  productTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 14,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  detailLabel: {
    color: C.grey,
    fontSize: 14,
  },

  detailValue: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '600',
  },

  plvItem: {
    fontSize: 14,
    color: C.dark,
    marginBottom: 8,
  },

  label: {
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '700',
    color: C.dark,
  },

  empty: {
    textAlign: 'center',
    color: C.grey,
    fontStyle: 'italic',
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  fontWeight: '600',
},

sectionTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: C.dark,
  marginBottom: 16,
},
});