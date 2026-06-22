import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { BASE_URL } from '@/config/api';
import { useRouter } from 'expo-router';
import { Animated, Easing } from 'react-native';


const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  blue:'#126bc4',
  green:'#328332',
};

interface Client {
  id: number;
  nom: string;
  latitude: string;
  longitude: string;
  zone: string;
  quartier: string;
  idagence: number;
  idcategorie: number;
}

interface CategorieClient {
  id: number;
  intitule: string;
  statut: string;
}

interface Agence {
  id: number;
  intitule: string;
}

interface TypeVisite {
  id: number;
  nom: string;
}

interface CategorieVisite {
  id: number;
  intitule: string;
}

export default function NewVisiteScreen() {
  const [typeVisite, setTypeVisite] = useState('');
  const [motifVisite, setMotifVisite] = useState('');
  const [motifVisiteList, setMotifVisiteList] = useState<CategorieVisite[]>([]);
  const [typeVisiteList, setTypeVisiteList] = useState<TypeVisite[]>([]);
  const [typeClient, setTypeClient] = useState('');
  const [typeClientList, setTypeClientList] = useState<CategorieClient[]>([]);
  const [agenceClient, setAgenceClient] = useState('');
  const [agenceClientList, setAgenceClientList] = useState<Agence[]>([]);
  const [client, setClient] = useState('');
  const [objectif, setObjectif] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const [motifVisiteId, setMotifVisiteId] = useState<number | null>(null);
  const [typeVisiteId, setTypeVisiteId] = useState<number | null>(null);

  const [modalNature, setModalNature] = useState(false);
  const [modalTypeVisite, setModalTypeVisite] = useState(false);
  const [modalTypeClient, setModalTypeClient] = useState(false);
  const [modalAgence, setModalAgence] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [dataClient, setDataClient] = useState<Client[]>([]);
  const [typeClientId, setTypeClientId] = useState<number | null>(null);
  const [agenceClientId, setAgenceClientId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isB2B, setIsB2B] = useState(false);

  const anim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchWithTimeout(`${BASE_URL}/clients`)
      .then((r) => r.json())
      .then((j) => setDataClient(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWithTimeout(`${BASE_URL}/categorieClients`)
      .then((r) => r.json())
      .then((j) => setTypeClientList(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWithTimeout(`${BASE_URL}/categorieVisites`)
      .then((r) => r.json())
      .then((j) => setMotifVisiteList(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWithTimeout(`${BASE_URL}/typeVisites`)
      .then((r) => r.json())
      .then((j) => setTypeVisiteList(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWithTimeout(`${BASE_URL}/agences`)
      .then((r) => r.json())
      .then((j) => setAgenceClientList(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  const filteredClients = dataClient.filter((c) => {
    const matchNom = c.nom?.toLowerCase().includes(client.toLowerCase());
    const matchType = !typeClientId || c.idcategorie === typeClientId;
    const matchAgence = !agenceClientId || c.idagence === agenceClientId;
    return matchNom && matchType && matchAgence;
  });

  const toggleB2B = () => {
    const newValue = !isB2B;
    setIsB2B(newValue);

    Animated.timing(anim, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  };

  const resetForm = () => {
    setClient(''); setClientId(null);
    setMotifVisite(''); setMotifVisiteId(null);
    setTypeVisite(''); setTypeVisiteId(null);
    setTypeClient(''); setTypeClientId(null);
    setAgenceClient(''); setAgenceClientId(null);
    setObjectif(''); setDate(new Date());
    setShowClientList(false);
  };
  const typeClientB2BList = typeClientList.filter(
    (c) => c.statut === 'B2B'
  );

  const handleSubmit = async () => {
    // if (!clientId || clientId < 1) {
    //   Alert.alert('Erreur', 'Veuillez sélectionner un client valide');
    //   return;
    // }
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    try {
      const body = {
        idclient: clientId,
        idutilisateur: user.id,
        idcategorie: motifVisiteId,
        date: formatDate(date),
        statut: 0,
        type: 0,
        idtype: typeVisiteId,
        object: objectif,
      };


        const response = await fetchWithTimeout(
            `${BASE_URL}/visite`,
            {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
            }
        );

        const text = await response.text();

        let result;
        
        try {
            result = JSON.parse(text);
            
        } catch {
            throw new Error('Réponse serveur invalide');
        }

        if (!response.ok) {
            throw new Error(result.message || 'Erreur insertion visite');
        }

        // const idVisite = result.id;

        // router.push({
        //     pathname: '/rapportB2B',
        //     params: {
        //     idVisite: String(idVisite),
        //     },
        // });

        resetForm();
        Alert.alert('Succès', 'Visite enregistrée avec succès');

    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const onChangeDate = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDate(selectedDate);
    setShowPicker(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={100}
      >
    {/* <View style={styles.field}>
      <View style={styles.labelRow}>
        <Ionicons name="business-outline" size={14} color={C.grey} style={styles.labelIcon} />
        <Text style={styles.label}>Visite B2B</Text>
      </View>

      <TouchableOpacity onPress={toggleB2B}>
        <View style={styles.switchContainer}>
            
            <View style={[
            styles.track,
            { backgroundColor: isB2B ? C.green : C.grey }
            ]} />

            <Animated.View
            style={[
                styles.circle,
                {
                transform: [{
                    translateX: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 22], // gauche → droite
                    }),
                }],
                },
            ]}
            >
            <Ionicons
                name={isB2B ? "checkmark" : "close"}
                size={14}
                color="#fff"
            />
            </Animated.View>

        </View>
        <Text style={[
            styles.switchLabel,
            { color: isB2B ? C.green : C.grey }
        ]}>
            {isB2B ? "B2B" : "B2B"}
        </Text>
        </TouchableOpacity>
    </View> */}
        {/* Nature visite */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="document-text-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Nature de la visite</Text>
          </View>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setModalNature(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !motifVisite && styles.placeholder]}>
              {motifVisite || 'Sélectionner...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Type visite */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="pricetag-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Type de visite</Text>
          </View>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setModalTypeVisite(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, !typeVisite && styles.placeholder]}>
              {typeVisite || 'Sélectionner...'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Type client */}
        {/* {isB2B && ( */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="people-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Type client</Text>
            </View>

            <TouchableOpacity
              style={styles.select}
              onPress={() => setModalTypeClient(true)}
            >
              <Text style={[styles.selectText, !typeClient && styles.placeholder]}>
                {typeClient || 'Sélectionner...'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>
        {/* )} */}

        {/* Agence */}
        {/* {isB2B && ( */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="business-outline" size={14} color={C.grey} style={styles.labelIcon} />
              <Text style={styles.label}>Agence</Text>
            </View>

            <TouchableOpacity
              style={styles.select}
              onPress={() => setModalAgence(true)}
            >
              <Text style={[styles.selectText, !agenceClient && styles.placeholder]}>
                {agenceClient || 'Sélectionner...'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>
        {/* )} */}
        
        {/* Client autocomplete  */}
        {/* {isB2B && ( */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="search-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Client</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Rechercher un client..."
            placeholderTextColor={C.grey}
            value={client}
            onChangeText={(t) => {
              setClient(t);
              setClientId(null);
              setShowClientList(true);
            }}
            onFocus={() => setShowClientList(true)}
          />
          {showClientList && filteredClients.length > 0 && (
            <View style={styles.suggestions}>
              {filteredClients.slice(0, 8).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setClient(c.nom);
                    setClientId(c.id);
                    setShowClientList(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{c.nom}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* )} */}
        

        {/* Date */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Date de la visite</Text>
          </View>
          {Platform.OS !== 'web' ? (
            <>
              <TouchableOpacity
                style={styles.select}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.selectText}>
                  {date.toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date}
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
                width: '93%',
                fontSize: 14,
                backgroundColor: C.white,
              }}
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
          )}
        </View>

        {/* Objectif */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="flag-outline" size={14} color={C.grey} style={styles.labelIcon} />
            <Text style={styles.label}>Objectif</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={4}
            placeholder="Décrire l'objectif de la visite..."
            placeholderTextColor={C.grey}
            value={objectif}
            onChangeText={setObjectif}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>✓  Valider</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Modals */}
      <Modal transparent visible={modalNature} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalNature(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Nature de la visite</Text>
            <ScrollView>
              {motifVisiteList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sheetItem}
                  onPress={() => {
                    setMotifVisite(item.intitule);
                    setMotifVisiteId(item.id);
                    setModalNature(false);
                  }}
                >
                  <Text style={styles.sheetItemText}>{item.intitule}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={modalTypeVisite} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalTypeVisite(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Type de visite</Text>
            <ScrollView>
              {typeVisiteList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sheetItem}
                  onPress={() => {
                    setTypeVisite(item.nom);
                    setTypeVisiteId(item.id);
                    setModalTypeVisite(false);
                  }}
                >
                  <Text style={styles.sheetItemText}>{item.nom}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={modalTypeClient} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalTypeClient(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Type de client</Text>
            <ScrollView>
              {typeClientList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sheetItem}
                  onPress={() => {
                    setTypeClient(item.intitule);
                    setTypeClientId(item.id);
                    setModalTypeClient(false);
                  }}
                >
                  <Text style={styles.sheetItemText}>{item.intitule}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={modalAgence} animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalAgence(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Agence</Text>
            <ScrollView>
              {agenceClientList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sheetItem}
                  onPress={() => {
                    setAgenceClient(item.intitule);
                    setAgenceClientId(item.id);
                    setModalAgence(false);
                  }}
                >
                  <Text style={styles.sheetItemText}>{item.intitule}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switchWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
},

switchLabel: {
  marginLeft: 10,
  fontSize: 14,
  fontWeight: '600',
},
  switchContainer: {
  width: 50,
  height: 28,
  justifyContent: 'center',
},

track: {
  width: 50,
  height: 24,
  borderRadius: 12,
},

circle: {
  position: 'absolute',
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 3,
},
  safe: {
    flex: 1,
    backgroundColor: C.lightBg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.dark,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: C.dark,
  },
  placeholder: {
    color: C.grey,
  },
  chevron: {
    fontSize: 14,
    color: C.grey,
  },
  input: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 14,
    color: C.dark,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  suggestions: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: C.dark,
  },
  submitBtn: {
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
  submitText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 12,
  },
  sheetItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetItemText: {
    fontSize: 15,
    color: C.dark,
  },
});
