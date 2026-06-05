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

export default function ResultRetail() {
  const { idVisite } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [rapport, setRapport] = useState<any>(null);
  const [produits, setProduits] = useState<any>(null);
  const [plv, setPlv] = useState<any>(null);
  const [autres, setAutres] = useState<any>(null);
  const [visiste, setVisite] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

    const responseVisite = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`
    );
    const visiteJson = await responseVisite.json();

      const responseRapport = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/getRapportByIdVisite/${idVisite}` //rapport
      );

      const responseProduits = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/getVueRapportProduitsByIdVisite/${idVisite}` //produits
      );

      const responsePlv = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/getVueRapportPlvByIdVisite/${idVisite}`  //plv
      );

      const responseAutres = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/getVueRapportAutresProduitsByIdVisite/${idVisite}`    //autres produits
      );

      const rapportJson = await responseRapport.json();
      const produitsJson = await responseProduits.json();
      const plvJson = await responsePlv.json();
      const autresJson = await responseAutres.json();

      setRapport(rapportJson);
      setProduits(produitsJson);
      setPlv(plvJson);
      setAutres(autresJson);
      setVisite(visiteJson);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Résultat Visite Retail
        </Text>
        <View style={styles.clientCard}>
            <Text style={styles.clientName}>
                {visiste?.client?.nom || 'Client inconnu'}
            </Text>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date visite :</Text>
                <Text style={styles.infoValue}>
                    {visiste?.date
                    ? new Date(visiste.date).toLocaleDateString('fr-FR')
                    : '-'}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Zone :</Text>
                <Text style={styles.infoValue}>
                {visiste?.client?.zone || '-'}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quartier :</Text>
                <Text style={styles.infoValue}>
                {visiste?.client?.quartier || '-'}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type client :</Text>
                <Text style={styles.infoValue}>
                {visiste?.client?.categorie_client?.intitule || '-'}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type visite   :</Text>
                <Text style={styles.infoValue}>
                {visiste?.categorie_visite?.intitule || '-'}
                </Text>
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

        {produits?.map(
          (item: any, index: number) => (
            <View
              key={index}
              style={styles.card}
            >
              <Text style={styles.productTitle}>
                {item?.intitule}
              </Text>

              <Text>
                Prix achat :
                {' '}
                {item?.prix_achat} Ar
              </Text>

              <Text>
                Prix vente gros :
                {' '}
                {item?.prix_vente_gros} Ar
              </Text>

              <Text>
                Prix vente détail :
                {' '}
                {item?.prix_vente_details} Ar
              </Text>

              <Text>
                Coût transport :
                {' '}
                {item?.cout_transport} Ar
              </Text>

              <Text>
                Marge :
                {' '}
                {item?.marge}
              </Text>

              <Text>
                Volume :
                {' '}
                {item?.volume} T
              </Text>
            </View>
          )
        )}

        {/* AUTRES PRODUITS */}
        <Text style={styles.bigSection}>
          Autres Produits
        </Text>

        {autres?.length > 0 ? (
          autres?.map(
            (item: any, index: number) => (
              <View
                key={index}
                style={styles.card}
              >
                <Text
                  style={styles.productTitle}
                >
                  {item.nom}
                </Text>

                <Text>
                  Prix achat :
                  {' '}
                  {item.prix_achat} Ar
                </Text>

                <Text>
                  Prix vente gros :
                  {' '}
                  {item.prix_vente_gros} Ar
                </Text>

                <Text>
                  Prix vente détail :
                  {' '}
                  {item.prix_vente_details} Ar
                </Text>

                <Text>
                  Transport :
                  {' '}
                  {item.cout_transport} Ar
                </Text>

                <Text>
                  Marge :
                  {' '}
                  {item.marge}
                </Text>

                <Text>
                  Volume :
                  {' '}
                  {item.volume} T
                </Text>
              </View>
            )
          )
        ) : (
          <Text style={styles.empty}>
            Aucun autre produit
          </Text>
        )}

        {/* PLV */}
        <Text style={styles.bigSection}>
          PLV présentes
        </Text>

        <View style={styles.card}>
          {plv?.length > 0 ? (
            plv?.map(
              (plv: any, index: number) => (
                <Text key={index}>
                  ✓ {plv.plv_nom}
                </Text>
              )
            )
          ) : (
            <Text>Aucune PLV</Text>
          )}
          <Text style={styles.label}>
            Autre PLV
          </Text>

          <Text>
            {rapport?.[0]?.autre_plv || 'Aucune autre PLV'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  content: {
    padding: 15,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  bigSection: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientCard: {
  backgroundColor: '#fff',
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  elevation: 2,
},

clientName: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 12,
},

infoRow: {
  flexDirection: 'row',
  marginBottom: 6,
},

infoLabel: {
  fontWeight: 'bold',
  width: 100,
},

infoValue: {
  flex: 1,
},

  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },

  empty: {
    color: '#777',
    fontStyle: 'italic',
  },
});