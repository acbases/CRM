import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView }
from 'react-native-keyboard-aware-scroll-view';

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

  date: string; // "2026-04-17 00:00:00"

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

  type_visite: {
    id: number;
    nom: string;
  } | null;
}

export default function RapportB2BScreen() {
  const { idVisite } = useLocalSearchParams();
  const [correpspondant, setCorrespondant] = useState<Correspondant[]>([]);
  const [modalCorrespondant, setModalCorrespondant] = useState(false);
  const [selectedCorrespondant, setSelectedCorrespondant] = useState<Correspondant | null>(null);
  const [visite, setVisite] = useState<Visite | null>(null);
  console.log('ID VISITE:', idVisite);

  const [description, setDescription] =
    useState('');

  const [actionAFaire, setActionAFaire] =
    useState('');

  const [photo, setPhoto] =
    useState<string | null>(null);

  const [dateRdv, setDateRdv] =
    useState(new Date());

  const [showPicker, setShowPicker] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`)
      .then(res => res.json())
      .then(json => setVisite(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (visite) {
      fetch(`https://allapps.alphaciment.com/crm_back/api/correspondantClientByIdClient/${visite.client.id}`)
        .then(res => res.json())
        .then(json => setCorrespondant(Array.isArray(json) ? json : []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [visite]);

const pickImage = async () => {
  Alert.alert(
    'Photo',
    'Choisissez une option',
    [
      {
        text: 'Caméra',
        onPress: openCamera,
      },
      {
        text: 'Galerie',
        onPress: openGallery,
      },
      {
        text: 'Annuler',
        style: 'cancel',
      },
    ]
  );
};

  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          'Autorisez l’accès à la galerie'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.3,
        });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

const openCamera = async () => {
  try {
    if (Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }

      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l’accès à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.3,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  } catch (error) {
    console.log(error);
  }
};

  const onChangeDate = (
    event: any,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      setDateRdv(selectedDate);
    }

    setShowPicker(false);
  };

const handleSubmit = async () => {
  try {
    if (!photo) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo');
      return;
    }

    const formData = new FormData();

    formData.append('idvisite', String(idVisite));
    formData.append('description', description);
    formData.append('action_a_faire', actionAFaire);
    formData.append(
      'prochaine_visite',
      dateRdv.toISOString().split('T')[0]
    );

    formData.append(
      'idcorrespondant',
      selectedCorrespondant
        ? String(selectedCorrespondant.correspondant.id)
        : ''
    );

    if (photo) {
      const filename = photo.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('sary', {
        uri: photo,
        name: filename,
        type,
      } as any);
    }

    // 1️⃣ ENREGISTREMENT RAPPORT
    const response = await fetch(
      'https://allapps.alphaciment.com/crm_back/api/rapportB2B',
      {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const text = await response.text();

    console.log('STATUS:', response.status);
    console.log('RAW RESPONSE:', text);

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      Alert.alert('Erreur API', JSON.stringify(data));
      return;
    }

    Alert.alert('Succès', 'Rapport enregistré');

    // 2️⃣ UPDATE STATUT VISITE
    try {
      const updateResponse = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/visite/${idVisite}`,
        {
          method: 'PUT', // ⚠️ change en PATCH si ton backend le demande
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            statut: 1, // ex: 1 = visite réalisée
          }),
        }
      );

      const updateText = await updateResponse.text();

      let updateData: any;

      try {
        updateData = JSON.parse(updateText);
      } catch {
        updateData = { raw: updateText };
      }

      console.log('VISITE UPDATE:', updateData);

      if (!updateResponse.ok) {
        Alert.alert('Erreur update visite', JSON.stringify(updateData));
      }
    } catch (err) {
      console.log('UPDATE VISITE ERROR:', err);
    }

    // reset form
    setDescription('');
    setActionAFaire('');
    setPhoto(null);
    setDateRdv(new Date());
    setSelectedCorrespondant(null);

    // redirection
    router.replace('/planning');

  } catch (error) {
    console.log('SUBMIT ERROR:', error);

    const message =
      error instanceof Error ? error.message : 'Erreur inconnue';

    Alert.alert('Erreur', 'Erreur serveur: ' + message);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Rapport B2B
        </Text>

        {/* CORRESPONDANT */}
        <View style={styles.block}>
          <Text style={styles.label}>Correspondant</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setModalCorrespondant(true)}
          >
            <Text>
              {selectedCorrespondant
                ? `${selectedCorrespondant.correspondant.nom} (${selectedCorrespondant.correspondant.poste})`
                : 'Sélectionner un correspondant'}
            </Text>
          </TouchableOpacity>

          <Modal transparent visible={modalCorrespondant} animationType="slide">
            <Pressable
              style={styles.overlay}
              onPress={() => setModalCorrespondant(false)}
            >
              <View style={styles.modal}>
                <ScrollView>
                  {correpspondant.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.item}
                      onPress={() => {
                        setSelectedCorrespondant(item);
                        setModalCorrespondant(false);
                      }}
                    >
                      <Text style={{ fontWeight: 'bold' }}>
                        {item.correspondant.nom}
                      </Text>
                      <Text>{item.correspondant.poste}</Text>
                      <Text>{item.correspondant.contact}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.block}>
          <Text style={styles.label}>
            Description
          </Text>
          <Text>Visite ID : {idVisite}</Text>
          <Text>Client ID : {visite?.client?.id}</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Saisir description..."
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* ACTION */}
        <View style={styles.block}>
          <Text style={styles.label}>
            Action à faire
          </Text>

          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Saisir action..."
            value={actionAFaire}
            onChangeText={setActionAFaire}
          />
        </View>

        {/* PHOTO */}
        <View style={styles.block}>
          <Text style={styles.label}>
            Importer photo
          </Text>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={pickImage}
          >
            <Text style={styles.uploadText}>
              📷 Choisir une photo
            </Text>
          </TouchableOpacity>

          {photo && (
            <Image
              source={{ uri: photo }}
              style={styles.image}
            />
          )}
        </View>

        {/* DATE RDV */}
        <View style={styles.block}>
          <Text style={styles.label}>
            Prochain rendez-vous
          </Text>

          {Platform.OS !== 'web' ? (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() =>
                  setShowPicker(true)
                }
              >
                <Text>
                  {dateRdv.toLocaleDateString(
                    'fr-FR'
                  )}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={dateRdv}
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
                border: '1px solid #ddd',
                width: '100%',
              }}
              value={
                dateRdv
                  .toISOString()
                  .split('T')[0]
              }
              onChange={(e) =>
                setDateRdv(
                  new Date(e.target.value)
                )
              }
            />
          )}
        </View>

        {/* BTN */}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit}
        >
          <Text style={styles.btnText}>
            ✓ Enregistrer
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  modal: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  maxHeight: '80%',
},

overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  padding: 20,
},

item: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

  content: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },

  block: {
    marginBottom: 20,
  },

  label: {
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  uploadBtn: {
    backgroundColor: '#d71f27',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  uploadText: {
    color: '#fff',
    fontWeight: '700',
  },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 15,
  },

  btn: {
    backgroundColor: '#d71f27',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});