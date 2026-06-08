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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter  } from 'expo-router';

export default function RapportRetail() {
    const router = useRouter();
  const { idVisite, idClient  } = useLocalSearchParams();

  const [produits, setProduits] = useState<any[]>([]);
  const [plvs, setPlvs] = useState<any[]>([]);

  const [autresProduits, setAutresProduits] = useState<any[]>([]);
  const [selectedPlvs, setSelectedPlvs] = useState<number[]>([]);
  const [visite, setVisite] = useState<any>(null);
const [errorMessage, setErrorMessage] = useState('');

  const [description, setDescription] = useState('');
  const [autrePlv, setAutrePlv] = useState('');
  const [debugLog, setDebugLog] = useState('');

const addLog = (title: string, data?: any) => {
  const msg =
    `[${new Date().toISOString()}] ${title}\n` +
    (data ? JSON.stringify(data, null, 2) : '');

  setDebugLog(prev => prev + '\n\n' + msg);
};

  // ===================== GET VISITE + PRODUITS =====================
useEffect(() => {
  addLog('FETCH VISITE START', { idVisite });

  fetch(`https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`)
    .then(async res => {
      addLog('VISITE STATUS', res.status);

      const text = await res.text();

      try {
        const json = JSON.parse(text);
        addLog('VISITE OK', json);

        setVisite(json);

        return json;
      } catch (e) {
        addLog('VISITE PARSE ERROR', text);
        throw e;
      }
    })
    .then(async json => {
      addLog('FETCH PRODUITS START');

      const prodRes = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/produits'
      );

      addLog('PRODUITS STATUS', prodRes.status);

      const prodText = await prodRes.text();

      try {
        const prodData = JSON.parse(prodText);

        addLog('PRODUITS OK', prodData);

        setProduits(
          prodData.map((p: any) => ({
            id: p.id,
            intitule: p.intitule,
            selected: false,
            prix_achat: '',
            prix_vente_gros: '',
            prix_vente_details: '',
            cout_transport: '',
            marge: '',
            volume: '',
          }))
        );
      } catch (e) {
        addLog('PRODUITS PARSE ERROR', prodText);
      }
    })
    .catch(err => {
      addLog('VISITE FETCH ERROR', err);
    });
}, [idVisite]);

  // ===================== GET PLV =====================
useEffect(() => {
  addLog('FETCH PLV START');

  fetch(`https://allapps.alphaciment.com/crm_back/api/plvs`)
    .then(async res => {
      addLog('PLV STATUS', res.status);

      const text = await res.text();

      try {
        const json = JSON.parse(text);
        addLog('PLV OK', json);
        setPlvs(json);
      } catch (e) {
        addLog('PLV PARSE ERROR', text);
      }
    })
    .catch(err => {
      addLog('PLV FETCH ERROR', err);
    });
}, []);

  // ===================== UPDATE PRODUIT =====================
  const updateProduit = (index: number, field: string, value: string) => {
    const copy = [...produits];
    copy[index][field] = value;
    setProduits(copy);
  };

  const toggleProduit = (index: number) => {
    const copy = [...produits];
    copy[index].selected = !copy[index].selected;
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
    .filter(p => p.selected)
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
    addLog('SUBMIT START');

    // 1️⃣ INSERT RAPPORT
    const resRapport = await fetch(
      'https://allapps.alphaciment.com/crm_back/api/rapport',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          idvisite: idVisite,
          description,
          autre_plv: autrePlv,
        }),
      }
    );

    const rapportText = await resRapport.text();
    addLog('RAPPORT RAW', rapportText);

    let rapportData: any;
    try {
      rapportData = JSON.parse(rapportText);
    } catch {
      addLog('RAPPORT JSON ERROR', rapportText);
      Alert.alert('Erreur', 'Réponse rapport invalide');
      return;
    }

    if (!resRapport.ok) {
      addLog('RAPPORT NOT OK', rapportData);
      Alert.alert('Erreur rapport', rapportData?.message ?? 'Erreur rapport');
      return;
    }

    // 2️⃣ INSERT PRODUIT_CLIENT (un POST par produit, champs à plat)
    addLog('IDCLIENT VALUE', { idClient, type: typeof idClient });

    const produitsSelectionnes = produits.filter(p => p.selected);

    addLog('PRODUITS SELECTIONNES', produitsSelectionnes.map(p => ({ id: p.id, intitule: p.intitule })));

    let produitClientData: any[] = [];

    for (const p of produitsSelectionnes) {
      const payload = { idclient: Number(idClient), idproduit: Number(p.id) };
      addLog(`PRODUIT CLIENT POST ${p.id}`, payload);

      const res = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/produitClient',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const text = await res.text();
      addLog(`PRODUIT CLIENT RAW ${p.id}`, text);

      if (!res.ok) {
        Alert.alert('Erreur produit_client', text);
        return;
      }

      try {
        const json = JSON.parse(text);
        // Le backend retourne soit l'objet directement, soit dans .data, soit un tableau
        const row = Array.isArray(json) ? json[0] : (json?.data ?? json);
        addLog(`PRODUIT CLIENT PARSED ${p.id}`, row);
        if (row?.id) {
          produitClientData.push({ ...row, _idproduit_origine: Number(p.id) });
        }
      } catch {
        addLog(`PRODUIT CLIENT JSON ERROR ${p.id}`, text);
      }
    }

    addLog('PRODUIT CLIENT DATA FINAL', produitClientData);

    // 3️⃣ INSERT REF PRIX PRODUIT
    const refPrix = produits
      .filter(p => p.selected)
      .map(p => {
        const match = produitClientData.find(
          (pc: any) =>
            Number(pc._idproduit_origine) === Number(p.id) ||
            Number(pc.idproduit) === Number(p.id)
        );
        addLog(`MATCH PRODUIT ${p.id}`, match ?? 'AUCUN MATCH');
        return {
          idvisite: Number(idVisite),
          idproduit: match?.id ?? null,
          prix_achat: p.prix_achat || null,
          prix_vente_gros: p.prix_vente_gros || null,
          prix_vente_details: p.prix_vente_details || null,
          cout_transport: p.cout_transport || null,
          marge: p.marge || null,
          volume: p.volume || null,
        };
      });

    addLog('REFPRIX PAYLOAD', refPrix);

    if (refPrix.length > 0) {
      const nullMatches = refPrix.filter(r => r.idproduit === null);
      if (nullMatches.length > 0) {
        addLog('REFPRIX NULL MATCHES', nullMatches);
        Alert.alert('Erreur', `${nullMatches.length} produit(s) sans correspondance produit_client`);
        return;
      }

      for (const item of refPrix) {
        addLog('REFPRIX POST ITEM', item);

        const resRefPrix = await fetch(
          'https://allapps.alphaciment.com/crm_back/api/refPrixProduit',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(item),
          }
        );

        const refPrixText = await resRefPrix.text();
        addLog('REFPRIX RAW', refPrixText);

        if (!resRefPrix.ok) {
          let refPrixData: any;
          try {
            refPrixData = JSON.parse(refPrixText);
          } catch {
            Alert.alert('Erreur ref_prix', refPrixText);
            return;
          }
          Alert.alert('Erreur ref_prix', JSON.stringify(refPrixData));
          return;
        }
      }
    }

    // 4️⃣ AUTRES PRODUITS (un POST par produit, champs à plat)
    for (const ap of autresProduits) {
      const { id: _localId, ...apFields } = ap; // exclure l'id temporaire frontend
      const autrePayload = {
        idvisite: Number(idVisite),
        nom: apFields.nom,
        prix_achat: apFields.prix_achat || null,
        prix_vente_gros: apFields.prix_vente_gros || null,
        prix_vente_details: apFields.prix_vente_details || null,
        cout_transport: apFields.cout_transport || null,
        marge: apFields.marge || null,
        volume: apFields.volume || null,
      };
      addLog('AUTRE PRODUIT POST ITEM', autrePayload);

      const resAutre = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/autreProduit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(autrePayload),
        }
      );

      const autreText = await resAutre.text();
      addLog('AUTRE PRODUIT RAW', autreText);

      if (!resAutre.ok) {
        let autreData: any;
        try {
          autreData = JSON.parse(autreText);
        } catch {
          Alert.alert('Erreur autres produits', autreText);
          return;
        }
        Alert.alert('Erreur autres produits', JSON.stringify(autreData));
        return;
      }
    }

    // 5️⃣ PLV (un POST par PLV sélectionnée)
    for (const idplv of selectedPlvs) {
      const plvPayload = { idvisite: Number(idVisite), idplv };
      addLog('PLV POST ITEM', plvPayload);

      const resPlv = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/recensementPlv',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(plvPayload),
        }
      );

      const plvText = await resPlv.text();
      addLog('PLV RAW', plvText);

      if (!resPlv.ok) {
        let plvData: any;
        try {
          plvData = JSON.parse(plvText);
        } catch {
          Alert.alert('Erreur PLV', plvText);
          return;
        }
        Alert.alert('Erreur PLV', JSON.stringify(plvData));
        return;
      }
    }

    // 6️⃣ UPDATE STATUT VISITE
    const resUpdate = await fetch(
      `https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ statut: 1 }),
      }
    );

    const updateText = await resUpdate.text();
    addLog('VISITE UPDATE RAW', updateText);

    if (!resUpdate.ok) {
      addLog('VISITE UPDATE FAILED', updateText);
      // Non bloquant, on continue
    }

    // 7️⃣ RESET
    setProduits(prev => prev.map(p => ({
      ...p,
      selected: false,
      prix_achat: '',
      prix_vente_gros: '',
      prix_vente_details: '',
      cout_transport: '',
      marge: '',
      volume: '',
    })));
    setAutresProduits([]);
    setSelectedPlvs([]);
    setDescription('');
    setAutrePlv('');
    setErrorMessage('');

    Alert.alert('Succès', 'Rapport complet enregistré ✅');
    router.replace('/planning');

  } catch (err: any) {
    addLog('SUBMIT ERROR', err);
    const msg = err?.message || JSON.stringify(err) || 'Erreur inconnue';
    setErrorMessage(msg);
    Alert.alert('Erreur', msg);
  }
};

  // ===================== UI =====================
  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 150,
        }}
      >

        <Text style={styles.title}>Rapport Retail</Text>
        {/* <Text>Id visite: {idVisite}</Text> */}
        <View style={styles.clientCard}>
        <Text style={styles.clientTitle}>👤 Informations client</Text>

        <Text style={styles.clientText}>
            Nom: {visite?.client?.nom || '—'}
        </Text>

        <Text style={styles.clientText}>
            Zone: {visite?.client?.zone || '—'}
        </Text>

        <Text style={styles.clientText}>
            Quartier: {visite?.client?.quartier || '—'}
        </Text>

        <Text style={styles.clientText}>
            Catégorie: {visite?.client?.categorie_client?.intitule || '—'}
        </Text>

        <Text style={styles.clientText}>
            Agence: {visite?.client?.agence?.intitule || '—'}
        </Text>

        {/* <Text style={styles.clientText}>
            Coordonnées: {visite?.client?.latitude}, {visite?.client?.longitude}
        </Text>

        <Text style={styles.clientText}>
            QR Code: {visite?.client?.status_qrcode ? 'Activé' : 'Désactivé'}
        </Text> */}
        </View>

        {/* PRODUITS */}
        <Text style={styles.section}>Produits</Text>

        {produits.map((p, i) => (
        <View key={p.id} style={styles.card}>

            <TouchableOpacity
            onPress={() => toggleProduit(i)}
            style={styles.productHeader}
            >
            <Text style={styles.name}>
                {p.selected ? '☑' : '☐'} {p.intitule}
            </Text>
            </TouchableOpacity>

            {p.selected && (
            <>
                <TextInput
                placeholder="Prix achat"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_achat}
                onChangeText={v =>
                    updateProduit(i, 'prix_achat', v)
                }
                />

                <TextInput
                placeholder="Prix vente gros"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_vente_gros}
                onChangeText={v =>
                    updateProduit(i, 'prix_vente_gros', v)
                }
                />

                <TextInput
                placeholder="Prix vente détail"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_vente_details}
                onChangeText={v =>
                    updateProduit(i, 'prix_vente_details', v)
                }
                />

                <TextInput
                placeholder="Coût transport"
                keyboardType="numeric"
                style={styles.input}
                value={p.cout_transport}
                onChangeText={v =>
                    updateProduit(i, 'cout_transport', v)
                }
                />

                <TextInput
                placeholder="Marge"
                keyboardType="numeric"
                style={styles.input}
                value={p.marge}
                onChangeText={v =>
                    updateProduit(i, 'marge', v)
                }
                />

                <TextInput
                placeholder="Quantité"
                keyboardType="numeric"
                style={styles.input}
                value={p.volume}
                onChangeText={v =>
                    updateProduit(i, 'volume', v)
                }
                />
            </>
            )}
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

            <TextInput placeholder="Quantité" style={styles.input}
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
        {/* DEBUG */}
        {/* {debugLog.length > 0 && (
        <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>── DEBUG ──</Text>
            <Text selectable style={styles.debugText}>{debugLog}</Text>
        </View>
        )} */}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===================== STYLE =====================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5', },
  title: { fontSize: 22, fontWeight: 'bold' },

  section: { marginTop: 20, fontWeight: 'bold' },

debugBox: {
  marginTop: 20,
  padding: 10,
  backgroundColor: '#1e1e1e',
  borderRadius: 8,
},
debugTitle: {
  color: '#00e676',
  fontWeight: 'bold',
  marginBottom: 4,
  fontSize: 12,
},
debugText: {
  color: '#ccc',
  fontSize: 10,
  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
},

  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },


  productHeader: {
  paddingVertical: 5,
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
  clientCard: {
  backgroundColor: '#fff',
  padding: 15,
  borderRadius: 12,
  marginTop: 10,
  elevation: 3,
},

clientTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
},

clientText: {
  fontSize: 14,
  marginTop: 4,
  color: '#333',
},
});