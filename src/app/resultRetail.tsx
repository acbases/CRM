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
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/resultRetail/${idVisite}`
      );

      const json = await response.json();

      setData(json);
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

  if (!data) {
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

        {/* RAPPORT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Commentaire
          </Text>

          <Text>
            {data.rapport?.description ||
              'Aucun commentaire'}
          </Text>

          <Text style={styles.label}>
            Autre PLV
          </Text>

          <Text>
            {data.rapport?.autre_plv || '-'}
          </Text>
        </View>

        {/* PRODUITS */}
        <Text style={styles.bigSection}>
          Produits relevés
        </Text>

        {data.ref_prix_produit?.map(
          (item: any, index: number) => (
            <View
              key={index}
              style={styles.card}
            >
              <Text style={styles.productTitle}>
                {item.produit?.intitule}
              </Text>

              <Text>
                Prix achat :
                {' '}
                {item.prix_achat}
              </Text>

              <Text>
                Prix vente gros :
                {' '}
                {item.prix_vente_gros}
              </Text>

              <Text>
                Prix vente détail :
                {' '}
                {item.prix_vente_details}
              </Text>

              <Text>
                Coût transport :
                {' '}
                {item.cout_transport}
              </Text>

              <Text>
                Marge :
                {' '}
                {item.marge}
              </Text>

              <Text>
                Volume :
                {' '}
                {item.volume}
              </Text>
            </View>
          )
        )}

        {/* AUTRES PRODUITS */}
        <Text style={styles.bigSection}>
          Autres Produits
        </Text>

        {data.autre_produit?.length > 0 ? (
          data.autre_produit.map(
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
                  {item.prix_achat}
                </Text>

                <Text>
                  Prix vente gros :
                  {' '}
                  {item.prix_vente_gros}
                </Text>

                <Text>
                  Prix vente détail :
                  {' '}
                  {item.prix_vente_details}
                </Text>

                <Text>
                  Transport :
                  {' '}
                  {item.cout_transport}
                </Text>

                <Text>
                  Marge :
                  {' '}
                  {item.marge}
                </Text>

                <Text>
                  Volume :
                  {' '}
                  {item.volume}
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
          {data.recensement_plv?.length > 0 ? (
            data.recensement_plv.map(
              (plv: any, index: number) => (
                <Text key={index}>
                  ✓ {plv.plv?.nom}
                </Text>
              )
            )
          ) : (
            <Text>Aucune PLV</Text>
          )}
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