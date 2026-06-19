import PageHeader from '@/components/PageHeader';
import { BASE_URL } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  blue:'#126bc4',
  blue2:'#509597',
  green:'#328332',
};

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('parseJsonSafe failed', response.url, text, error);
    return null;
  }
}

async function parseJsonOrRaw(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export default function RapportRetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { idVisite, idClient  } = useLocalSearchParams();

  const { prospect } = useLocalSearchParams();
  const [client, setClient]= useState<any | null>(null);

  const [produits, setProduits] = useState<any[]>([]);
  const [plvs, setPlvs] = useState<any[]>([]);

  const [autresProduits, setAutresProduits] = useState<any[]>([]);
  const [selectedPlvs, setSelectedPlvs] = useState<number[]>([]);
  const [visite, setVisite] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [description, setDescription] = useState('');
  const [autrePlv, setAutrePlv] = useState('');
  const [debugLog, setDebugLog] = useState('');
  const [loading, setLoading] = useState(true);

  const [photo, setPhoto] = useState<string | null>(null);




const addLog = (title: string, data?: any) => {
  const msg =
    `[${new Date().toISOString()}] ${title}\n` +
    (data ? JSON.stringify(data, null, 2) : '');

  setDebugLog(prev => prev + '\n\n' + msg);
};

useEffect(() => {
    if (!prospect) {
      return
    }
    const loadClient = async () => {
      try {
        const res = await fetch(`${BASE_URL}/client/${prospect}`);
        const json = await parseJsonSafe<any>(res);
        if (json) setClient(json);
      } catch (err: any) {
        Alert.alert('Erreur', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [prospect]);

  // ===================== GET VISITE + PRODUITS =====================
useEffect(() => {
  if (!idVisite) return;

  addLog('FETCH VISITE START', { idVisite });

  const loadVisite = async () => {
    try {
      const res = await fetch(`${BASE_URL}/visite/${idVisite}`);
      addLog('VISITE STATUS', res.status);

      const json = await parseJsonSafe<any>(res);
      if (!json) {
        addLog('VISITE PARSE FAILED', 'Invalid JSON response');
        return;
      }

      addLog('VISITE OK', json);
      setVisite(json);
    } catch (err: any) {
      addLog('VISITE FETCH ERROR', err);
    }
  };
  loadVisite();
}, [idVisite]);

useEffect(() => {
  addLog('FETCH PRODUITS START');

  const loadProduits = async () => {
    try {
      const res = await fetch(`${BASE_URL}/produits`);
      addLog('PRODUITS STATUS', res.status);

      const prodData = await parseJsonSafe<any>(res);
      if (!prodData) {
        addLog('PRODUITS PARSE FAILED', 'Invalid JSON response');
        return;
      }

      addLog('PRODUITS OK', prodData);

      const list = Array.isArray(prodData)
        ? prodData
        : prodData?.data || prodData?.produits || [];

      setProduits(
        list.map((p: any) => ({
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
    } catch (err: any) {
      addLog('PRODUITS FETCH ERROR', err);
    }
  };
  loadProduits();
}, []);

  // ===================== GET PLV =====================
useEffect(() => {
  addLog('FETCH PLV START');

  const loadPlvs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/plvs`);
      addLog('PLV STATUS', res.status);

      const json = await parseJsonSafe<any>(res);
      if (json) {
        addLog('PLV OK', json);
        setPlvs(json);
      } else {
        addLog('PLV PARSE FAILED', 'Invalid JSON response');
      }
    } catch (err: any) {
      addLog('PLV FETCH ERROR', err);
    }
  };
  loadPlvs();
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

// ======================PHOTO=======================================================



    const pickImage = () => {
      Alert.alert('Photo', 'Choisissez une source', [
        { text: 'Caméra', onPress: openCamera },
        { text: 'Galerie', onPress: openGallery },
        { text: 'Annuler', style: 'cancel' },
      ]);
    };
  
    const openGallery = async () => {
      try {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission refusée', "Autorisez l'accès à la galerie");
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.3,
        });
        if (!result.canceled) setPhoto(result.assets[0].uri);
      } catch {}
    };
  
    const openCamera = async () => {
      try {
        if (Platform.OS === 'web') {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.3,
          });
          if (!result.canceled) setPhoto(result.assets[0].uri);
          return;
        }
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission refusée', "Autorisez l'accès à la caméra");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.3 });
        if (!result.canceled) setPhoto(result.assets[0].uri);
      } catch {}
    };
  

  // ===================== SUBMIT =====================
const handleSubmit = async () => {
  if (!photo) {
    Alert.alert('Erreur', 'Veuillez ajouter une photo');
    return;
  }
  try {
    let visiteId: string | number;

    if (!idVisite) {
      const corps = {
        idclient: prospect,
        idutilisateur: user.id,
        idcategorie: 5,
        date: new Date().toISOString().split('T')[0],
        statut: 0,
        type: 1,
        idtype: 2,
        object: null,
      };

      const response = await fetchWithTimeout(
        `${BASE_URL}/visite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(corps),
        }
      );

      console.log('Status:', response.status);

      const result = await parseJsonOrRaw(response);
      console.log('Réponse brute:', result);
      console.log('TEXT VISITE :', JSON.stringify(result));

      if (!response.ok) {
        throw new Error(result?.message || 'Erreur insertion visite');
      }

      if (!result?.id) {
        throw new Error('Réponse serveur invalide - pas de visite ID');
      }

      visiteId = result.id; 
    }
    else{
      visiteId = idVisite as string;
    }
    addLog('SUBMIT START');

    // 1️⃣ INSERT RAPPORT
    
    const formData = new FormData();
    formData.append('idvisite', String(visiteId));
    formData.append('description', description);
    formData.append('autre_plv', autrePlv);
    
    const filename = photo.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    formData.append('sary', {
      uri: photo,
      name: filename,
      type: match ? `image/${match[1]}` : 'image/jpeg',
    } as any);

    const resRapport = await fetch(`${BASE_URL}/rapport`, {
      method: 'POST',
      headers: {
        // ⚠️ Ne PAS mettre Content-Type manuellement
        // fetch le génère automatiquement avec le boundary multipart
        'Accept': 'application/json',
      },
      body: formData,
    });

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
      const clientId = idClient ?? prospect;
      const payload = { idclient: Number(clientId), idproduit: Number(p.id) };
      addLog(`PRODUIT CLIENT POST ${p.id}`, payload);

      const res = await fetch(
        `${BASE_URL}/produitClient`,
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
          idvisite: Number(visiteId),
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
          `${BASE_URL}/refPrixProduit`,
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
        idvisite: Number(visiteId),
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
        `${BASE_URL}/autreProduit`,
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
      const plvPayload = { idvisite: Number(visiteId), idplv };
      addLog('PLV POST ITEM', plvPayload);

      const resPlv = await fetch(
        `${BASE_URL}/recensementPlv`,
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
      `${BASE_URL}/visite/${visiteId}`,
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
    setPhoto(null);
    setErrorMessage('');

    Alert.alert('Succès', 'Rapport complet enregistré ✅');
    router.replace('/planning');

    }catch (err: any) {
      addLog('SUBMIT ERROR', err);
      const msg = err?.message || JSON.stringify(err) || 'Erreur inconnue';
      setErrorMessage(msg);
      Alert.alert('Erreur', msg);
    }
};

  // ===================== UI =====================
  return (
    <View style={styles.safe}>
    {/* <SafeAreaView style={styles.container}> */}
      <PageHeader title="Rapport retail" />
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
        >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >

        {/* <Text style={styles.title}>Rapport Retail</Text> */}
        {/* <Text>Id visite: {idVisite}</Text> */}
        
        {visite?.client ? (
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
          </View>
        ) : (
          <View style={styles.clientCard}>
            <Text style={styles.clientTitle}>👤 Informations client</Text>
            <Text style={styles.clientText}>
              Nom: {client?.nom || '—'}
            </Text>

            <Text style={styles.clientText}>
                Zone: {client?.zone || '—'}
            </Text>

            <Text style={styles.clientText}>
                Quartier: {client?.quartier || '—'}
            </Text>

            <Text style={styles.clientText}>
                Catégorie: {client?.categorie_client?.intitule || '—'}
            </Text>
          </View>
        )}
        

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
                placeholder="Prix achat (Ar)"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_achat}
                onChangeText={v =>
                    updateProduit(i, 'prix_achat', v)
                }
                />

                <TextInput
                placeholder="Prix vente gros (Ar)"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_vente_gros}
                onChangeText={v =>
                    updateProduit(i, 'prix_vente_gros', v)
                }
                />

                <TextInput
                placeholder="Prix vente détail (Ar)"
                keyboardType="numeric"
                style={styles.input}
                value={p.prix_vente_details}
                onChangeText={v =>
                    updateProduit(i, 'prix_vente_details', v)
                }
                />

                <TextInput
                placeholder="Coût transport (Ar)"
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
                placeholder="Quantité (Tonnes)"
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

            <TextInput placeholder="Prix achat (Ar)" style={styles.input} keyboardType="numeric"
              value={p.prix_achat}
              onChangeText={v => updateAutre(i, 'prix_achat', v)}
            />

            <TextInput placeholder="Prix vente gros (Ar)" style={styles.input} keyboardType="numeric"
              value={p.prix_vente_gros}
              onChangeText={v => updateAutre(i, 'prix_vente_gros', v)}
            />

            <TextInput placeholder="Prix vente détail (Ar)" style={styles.input} keyboardType="numeric"
              value={p.prix_vente_details}
              onChangeText={v => updateAutre(i, 'prix_vente_details', v)}
            />

            <TextInput placeholder="Coût transport (Ar)" style={styles.input} keyboardType="numeric"
              value={p.cout_transport}
              onChangeText={v => updateAutre(i, 'cout_transport', v)}
            />

            <TextInput placeholder="Marge" style={styles.input} keyboardType="numeric"
              value={p.marge}
              onChangeText={v => updateAutre(i, 'marge', v)}
            />

            <TextInput placeholder="Quantité (Tonnes)" style={styles.input} keyboardType="numeric"
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
        <View style={styles.block}>
          <TextInput
            placeholder="Autre PLV"
            style={styles.input}
            value={autrePlv}
            onChangeText={setAutrePlv}
          />
        </View>

        {/* Photo */}
        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Ionicons name="camera-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Photo</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={18} color={C.white} style={{ marginRight: 8 }} />
            <Text style={styles.uploadText}>Choisir une photo</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={styles.photoPreview} />}
        </View>

        {/* COMMENTAIRE */}
        <Text style={styles.section}>Commentaire</Text>

        <TextInput
          placeholder="Commentaire visite"
          style={[styles.input, { height: 100 }]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text
            style={{
              color: C.white,
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 0.5,
            }}
          >
            Enregistrer rapport
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

      </KeyboardAwareScrollView>
    {/* </SafeAreaView> */}
    </View>
  );
}

// ===================== STYLE =====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.lightBg,
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  section: {
    fontSize: 20,
    fontWeight: '700',
    color: C.dark,
    marginTop: 28,
    marginBottom: 12,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  productHeader: {
    paddingVertical: 4,
    marginBottom: 8,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: C.dark,
  },

  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    fontSize: 15,
    color: C.dark,
  },

  addBtn: {
    backgroundColor: C.blue2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,

    shadowColor: C.blue2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 3,
  },

  plv: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 15,
    color: C.dark,
  },

  submit: {
    backgroundColor: C.blue,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,

    shadowColor: C.blue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 4,
  },

  clientCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    marginBottom: 8,
    borderLeftWidth: 5,
    borderLeftColor: C.primary,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  clientTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 14,
  },

  clientText: {
    fontSize: 15,
    color: C.grey,
    marginBottom: 8,
    lineHeight: 22,
  },

  debugBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },

  debugTitle: {
    color: '#4ADE80',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 12,
  },

  debugText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  block: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  labelIcon: { marginRight: 6 },
  label: { fontSize: 13, fontWeight: '600', color: C.dark },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.blue2,
    padding: 14,
    borderRadius: 12,
  },
  uploadText: { color: C.white, fontWeight: '700', fontSize: 14 },
  photoPreview: { width: '100%', height: 220, borderRadius: 14, marginTop: 12 },
});