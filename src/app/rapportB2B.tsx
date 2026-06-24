import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BASE_URL } from '../config/api';
import NewCorrespondant from './components/newCorrespondant';

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

interface Correspondant {
  id: number;
  idclient: number;
  idcorrespondant: number;
  correspondant: {
    id: number;
    nom: string;
    poste: string;
    contact: string;
  };
}

interface Visite {
  id: number;
  idclient: number;
  idutilisateur: number;
  idcategorie: number;
  idtype: number | null;
  date: string;
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
    categorie_client: { id: number; intitule: string; statut: string; };
  };
  categorie_visite: { id: number; intitule: string };
  type_visite: { id: number; nom: string } | null;
}

export default function RapportB2BScreen() {
  const { idVisite } = useLocalSearchParams();
  const { prospect } = useLocalSearchParams();

  const router = useRouter();

  const [correspondants, setCorrespondants] = useState<Correspondant[]>([]);
  const [modalCorrespondant, setModalCorrespondant] = useState(false);
  const [selectedCorrespondant, setSelectedCorrespondant] = useState<Correspondant | null>(null);
  const [visite, setVisite] = useState<Visite | null>(null);
  const [showCorrespondant, setShowCorrespondant] = useState(false);

  const [description, setDescription] = useState('');
  const [actionAFaire, setActionAFaire] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [dateRdv, setDateRdv] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [client, setClient]= useState<any | null>(null);
  const { user } = useAuth();

  // const { body } = useLocalSearchParams();
  //   const voky= body
  //   ? JSON.parse(body as string) as {
  //       idClient:number;
  //       idutilisateur: number;
  //       idcategorie: number;
  //       date: string;
  //       statut: number;
  //       type: number;
  //       idtype: number;
  //       object: string;
  //     }
  //   : null;

  useEffect(() => {
    if (!idVisite) return;

    const loadVisite = async () => {
      try {
        const response = await fetch(`${BASE_URL}/visite/${idVisite}`);
        const json = await parseJsonSafe<any>(response);
        if (json) {
          setVisite(json);
          return;
        }
        Alert.alert('Erreur', 'Réponse serveur invalide pour la visite');
      } catch (err: any) {
        Alert.alert('Erreur', err.message ?? 'Impossible de charger la visite');
      } finally {
        setLoading(false);
      }
    };

    loadVisite();
  }, [idVisite]);

useEffect(() => {
  if (!prospect) return;

  const loadClient = async () => {
    try {
      const response = await fetch(`${BASE_URL}/client/${prospect}`);
      const json = await parseJsonSafe<any>(response);
      if (json) {
        setClient(json);
        return;
      }
      Alert.alert('Erreur', 'Réponse serveur invalide pour le client');
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de charger le client');
    } finally {
      setLoading(false);
    }
  };

  loadClient();
}, [prospect]);
  

  useEffect(() => {
    const idClient = visite?.client?.id ?? prospect;

    if (!idClient) return;

    const loadCorrespondants = async () => {
      try {
        const response = await fetch(`${BASE_URL}/correspondantClientByIdClient/${idClient}`);
        const json = await parseJsonSafe<any>(response);
        setCorrespondants(Array.isArray(json) ? json : []);
      } catch {
        setCorrespondants([]);
      }
    };

    loadCorrespondants();
  }, [visite, prospect]);

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

  const onChangeDate = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDateRdv(selectedDate);
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    
    if (!photo) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo');
      return;
    }
    setSubmitting(true);
    try{ 
      let visiteId: string | number;
      if (!idVisite) {
        const corps = {
          idclient: prospect,
          idutilisateur: user.id,
          idcategorie: 4,
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

        const result = await parseJsonSafe<any>(response);
        if (!response.ok) {
          throw new Error(result?.message || 'Erreur insertion visite');
        }
        if (!result?.id) {
          throw new Error('Réponse serveur invalide - pas de visite ID');
        }

        visiteId = result.id; 
      }else{
        visiteId = idVisite as string;
      }
        
      const formData = new FormData();
      formData.append('idvisite', String(visiteId));
      formData.append('description', description);
      formData.append('action_a_faire', actionAFaire);
      formData.append('prochaine_visite', dateRdv ? dateRdv.toISOString().split('T')[0] : '');
      formData.append(
        'idcorrespondant',
        selectedCorrespondant ? String(selectedCorrespondant.correspondant.id) : ''
      );

      const filename = photo.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      formData.append('sary', {
        uri: photo,
        name: filename,
        type: match ? `image/${match[1]}` : 'image/jpeg',
      } as any);

      const response = await fetch(
        `${BASE_URL}/rapportB2B`,
        { method: 'POST', body: formData, headers: { Accept: 'application/json' } }
      );

      const data = await parseJsonOrRaw(response);

      if (!response.ok) {
        Alert.alert('Erreur', typeof data === 'object' ? JSON.stringify(data) : String(data));
        return;
      }

      await fetch(`${BASE_URL}/visite/${visiteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ statut: 1 }),
      }).catch(() => {});

      Alert.alert('Succès', 'Rapport enregistré avec succès');
      setDescription('');
      setActionAFaire('');
      setPhoto(null);
      setDateRdv(new Date());
      setSelectedCorrespondant(null);
      router.replace('/planning');
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  };
    
  if (loading) {
    return (
      <View style={styles.safe}>
        <PageHeader title="Rapport B2B" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <PageHeader title="Rapport B2B" />

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
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false} 
          // contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >

          {/* Infos client */}
          
            <View style={styles.clientCard}>

              {/* Header client */}
              <View style={styles.clientHeader}>
                <View style={styles.clientAvatar}>
                  <Ionicons name="business-outline" size={18} color={C.white} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>
                    {visite?.client?.nom || client?.nom}
                  </Text>

                  <Text style={styles.clientSub}>
                    Client B2B
                  </Text>
                </View>
              </View>

              {/* Category */}
              <View style={styles.clientRow}>
                <Ionicons name="pricetag-outline" size={16} color={C.primary} style={styles.rowIcon} />
                <Text style={styles.clientMeta}>
                  {visite?.client?.categorie_client?.intitule ||
                    client?.categorie_client?.intitule || '—'}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.clientRow}>
                <Ionicons name="location-outline" size={16} color={C.primary} style={styles.rowIcon} />
                <Text style={styles.clientMeta}>
                  {(visite?.client?.zone || client?.zone) || '—'} — {(visite?.client?.quartier || client?.quartier) || '—'}
                </Text>
              </View>

              {/* Commercial */}
              <View style={styles.clientRow}>
                <Ionicons name="person-outline" size={16} color={C.primary} style={styles.rowIcon} />
                <Text style={styles.clientMeta}>
                  {(user.name) || '—'} {(user.firstname) || '—'}
                </Text>
              </View>

            </View>

          {/* Correspondant */}
          <View style={styles.block}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Correspondant</Text>
            </View>
            <View style={styles.rowFields}>
              <TouchableOpacity
                style={[styles.select, { flex: 1 }]}
                onPress={() => setModalCorrespondant(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.selectText, !selectedCorrespondant && styles.placeholder]}>
                  {selectedCorrespondant
                    ? `${selectedCorrespondant.correspondant.nom} (${selectedCorrespondant.correspondant.poste})`
                    : 'Sélectionner...'}
                </Text>
                <Ionicons name="chevron-down-outline" size={14} color={C.grey} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCorrespondantBtn}
                onPress={() => setShowCorrespondant(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-outline" size={22} color={C.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.block}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Description</Text>
            </View>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Saisir une description..."
              placeholderTextColor={C.grey}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Action à faire */}
          <View style={styles.block}>
            <View style={styles.labelRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Action à faire</Text>
            </View>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Saisir l'action à faire..."
              placeholderTextColor={C.grey}
              value={actionAFaire}
              onChangeText={setActionAFaire}
              textAlignVertical="top"
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

          {/* Prochain RDV */}
          <View style={styles.block}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Prochain rendez-vous</Text>
            </View>
            {Platform.OS !== 'web' ? (
              <>
                <TouchableOpacity
                  style={styles.select}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectText}>
                    {dateRdv ? dateRdv.toLocaleDateString('fr-FR') : 'Sélectionner une date'}
                  </Text>
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={dateRdv  ?? new Date()}
                    mode="date"
                    display="calendar"
                    onChange={onChangeDate}
                  />
                )}
              </>
            ) : (
              <input
                type="date"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  width: '100%',
                  fontSize: 14,
                  backgroundColor: C.white,
                }}
                value={dateRdv ? dateRdv.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRdv(new Date(e.target.value))}
              />
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submit, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                
                <Text style={{
                  color: C.white,
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                }}> 
                ✓ Enregistrer rapport</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollView>

      {/* Modal correspondants */}
      <Modal transparent visible={modalCorrespondant} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalCorrespondant(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Sélectionner un correspondant</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {correspondants.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sheetItem}
                  onPress={() => { setSelectedCorrespondant(item); setModalCorrespondant(false); }}
                >
                  <Text style={styles.sheetItemName}>{item.correspondant.nom}</Text>
                  <Text style={styles.sheetItemMeta}>{item.correspondant.poste}</Text>
                  <Text style={styles.sheetItemMeta}>{item.correspondant.contact}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <NewCorrespondant
        visible={showCorrespondant}
        prospect={0}
        idclient={Number(visite?.idclient ?? prospect)}
        onClose={() => setShowCorrespondant(false)}
        onSave={async () => {
          setShowCorrespondant(false);

          const idClient =
            visite?.client?.id ?? visite?.idclient ?? prospect;

          if (!idClient) return;

          try {
            const res = await fetch(
              `${BASE_URL}/correspondantClientByIdClient/${idClient}`
            );

            const json = await parseJsonSafe<any>(res);
            setCorrespondants(Array.isArray(json) ? json : []);
          } catch (e) {
            setCorrespondants([]);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightBg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: C.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  clientName: { fontSize: 16, fontWeight: '700', color: C.dark, marginBottom: 8 ,},
  clientRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6,
    paddingLeft: 4,},
  rowIcon: { marginRight: 8, width: 18 ,},
  clientMeta: { fontSize: 13, color: C.grey,
    flex: 1, },

  block: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  labelIcon: { marginRight: 6 },
  label: { fontSize: 13, fontWeight: '600', color: C.dark },

  rowFields: { flexDirection: 'row', gap: 10, alignItems: 'center' },

  select: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 1,
  },
  selectText: { flex: 1, fontSize: 14, color: C.dark },
  placeholder: { color: C.grey },

  addCorrespondantBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  textArea: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 14,
    color: C.dark,
  },

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

  submitText: { color: C.white, fontSize: 16, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '70%',
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: C.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: C.dark, marginBottom: 12 },
  sheetItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetItemName: { fontSize: 15, fontWeight: '600', color: C.dark },
  sheetItemMeta: { fontSize: 13, color: C.grey, marginTop: 2 },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  clientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },


  clientSub: {
    fontSize: 12,
    color: C.grey,
    marginTop: 2,
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

});
