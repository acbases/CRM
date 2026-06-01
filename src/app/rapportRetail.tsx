import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RapportRetail() {
  const { idVisite } = useLocalSearchParams();

  const [produits, setProduits] = useState<any[]>([]);
  const [plvs, setPlvs] = useState<any[]>([]);

  const [autresProduits, setAutresProduits] = useState<any[]>([]);
  const [selectedPlvs, setSelectedPlvs] = useState<number[]>([]);

  const [description, setDescription] = useState('');
  const [autrePlv, setAutrePlv] = useState('');

  // ===================== GET VISITE + PRODUITS =====================
  useEffect(() => {
    fetch(`https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`)
      .then(res => res.json())
      .then(async json => {
        const idClient = json.client.id;

        const prodRes = await fetch(
          `https://allapps.alphaciment.com/crm_back/api/getProduits/${idClient}`
        );

        const prodData = await prodRes.json();

        setProduits(
          prodData.map((p: any) => ({
            id: p.id,
            intitule: p.intitule,
            prix_achat: '',
            prix_vente_gros: '',
            prix_vente_details: '',
            cout_transport: '',
            marge: '',
            volume: '',
          }))
        );
      })
      .catch(err => console.log(err));
  }, [idVisite]);

  // ===================== GET PLV =====================
  useEffect(() => {
    fetch(`https://allapps.alphaciment.com/crm_back/api/getPlvs`)
      .then(res => res.json())
      .then(setPlvs)
      .catch(err => console.log(err));
  }, []);

  // ===================== UPDATE PRODUIT =====================
  const updateProduit = (index: number, field: string, value: string) => {
    const copy = [...produits];
    copy[index][field] = value;
    setProduits(copy);
  };

  // ===================== AUTRES PRODUITS =====================
  const addAutreProduit = () => {
    setAutresProduits([
      ...autresProduits,
      {
        id: Date.now(),
        nom: '',
        prix_achat: '',
        prix_vente_gros: '',
        prix_vente_details: '',
        cout_transport: '',
        marge: '',
        volume: '',
      },
    ]);
  };

  const updateAutre = (index: number, field: string, value: string) => {
    const copy = [...autresProduits];
    copy[index][field] = value;
    setAutresProduits(copy);
  };

  // ===================== PLV TOGGLE =====================
  const togglePlv = (id: number) => {
    setSelectedPlvs(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  // ===================== FILTER PRODUITS VALIDES =====================
  const buildRefPrix = () => {
    return produits
      .filter(p =>
        p.prix_achat ||
        p.prix_vente_gros ||
        p.prix_vente_details ||
        p.cout_transport ||
        p.marge ||
        p.volume
      )
      .map(p => ({
        idproduit: p.id,
        prix_achat: p.prix_achat,
        prix_vente_gros: p.prix_vente_gros,
        prix_vente_details: p.prix_vente_details,
        cout_transport: p.cout_transport,
        marge: p.marge,
        volume: p.volume,
      }));
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async () => {
    try {
      const payload = {
        rapport: {
          idvisite: idVisite,
          description,
          autre_plv: autrePlv,
        },

        ref_prix_produit: buildRefPrix(),

        autre_produit: autresProduits,

        recensement_plv: selectedPlvs.map(id => ({
          idplv: id,
        })),
      };

      const res = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/rapportRetail',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Erreur', JSON.stringify(data));
        return;
      }

      Alert.alert('Succès', 'Rapport enregistré');
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur serveur');
    }
  };

  // ===================== UI =====================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>Rapport Retail</Text>

        {/* PRODUITS */}
        <Text style={styles.section}>Produits</Text>

        {produits.map((p, i) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.name}>{p.intitule}</Text>

            <TextInput placeholder="Prix achat" style={styles.input}
              value={p.prix_achat}
              onChangeText={v => updateProduit(i, 'prix_achat', v)}
            />

            <TextInput placeholder="Prix vente gros" style={styles.input}
              value={p.prix_vente_gros}
              onChangeText={v => updateProduit(i, 'prix_vente_gros', v)}
            />

            <TextInput placeholder="Prix vente détail" style={styles.input}
              value={p.prix_vente_details}
              onChangeText={v => updateProduit(i, 'prix_vente_details', v)}
            />

            <TextInput placeholder="Transport" style={styles.input}
              value={p.cout_transport}
              onChangeText={v => updateProduit(i, 'cout_transport', v)}
            />

            <TextInput placeholder="Marge" style={styles.input}
              value={p.marge}
              onChangeText={v => updateProduit(i, 'marge', v)}
            />

            <TextInput placeholder="Volume" style={styles.input}
              value={p.volume}
              onChangeText={v => updateProduit(i, 'volume', v)}
            />
          </View>
        ))}

        {/* AUTRES PRODUITS */}
        <Text style={styles.section}>Autres produits</Text>

        {autresProduits.map((p, i) => (
          <View key={p.id} style={styles.card}>

            <TextInput placeholder="Nom produit" style={styles.input}
              value={p.nom}
              onChangeText={v => updateAutre(i, 'nom', v)}
            />

            <TextInput placeholder="Prix achat" style={styles.input}
              value={p.prix_achat}
              onChangeText={v => updateAutre(i, 'prix_achat', v)}
            />

            <TextInput placeholder="Prix vente gros" style={styles.input}
              value={p.prix_vente_gros}
              onChangeText={v => updateAutre(i, 'prix_vente_gros', v)}
            />

            <TextInput placeholder="Prix vente détail" style={styles.input}
              value={p.prix_vente_details}
              onChangeText={v => updateAutre(i, 'prix_vente_details', v)}
            />

            <TextInput placeholder="Transport" style={styles.input}
              value={p.cout_transport}
              onChangeText={v => updateAutre(i, 'cout_transport', v)}
            />

            <TextInput placeholder="Marge" style={styles.input}
              value={p.marge}
              onChangeText={v => updateAutre(i, 'marge', v)}
            />

            <TextInput placeholder="Volume" style={styles.input}
              value={p.volume}
              onChangeText={v => updateAutre(i, 'volume', v)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addAutreProduit}>
          <Text style={{ color: '#fff' }}>+ Autre produit</Text>
        </TouchableOpacity>

        {/* PLV */}
        <Text style={styles.section}>PLV</Text>

        {plvs.map(p => (
          <TouchableOpacity key={p.id} onPress={() => togglePlv(p.id)}>
            <Text style={styles.plv}>
              {selectedPlvs.includes(p.id) ? '☑' : '☐'} {p.nom}
            </Text>
          </TouchableOpacity>
        ))}

        <TextInput
          placeholder="Autre PLV"
          style={styles.input}
          value={autrePlv}
          onChangeText={setAutrePlv}
        />

        {/* COMMENTAIRE */}
        <Text style={styles.section}>Commentaire</Text>

        <TextInput
          placeholder="Description visite"
          style={[styles.input, { height: 100 }]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            ENREGISTRER
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ===================== STYLE =====================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },

  section: { marginTop: 20, fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
  },

  addBtn: {
    backgroundColor: '#3498db',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  plv: {
    padding: 8,
    fontSize: 15,
  },

  submit: {
    backgroundColor: '#e74c3c',
    padding: 15,
    marginTop: 25,
    borderRadius: 10,
    alignItems: 'center',
  },

  name: {
    fontWeight: 'bold',
  },
});