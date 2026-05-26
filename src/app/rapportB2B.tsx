import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';

export default function RapportB2BScreen() {
  const { idVisite } = useLocalSearchParams();

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
          quality: 0.8,
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
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          'Autorisez l’accès à la caméra'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
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

  const handleSubmit = () => {
    const body = {
      description,
      actionAFaire,
      photo,
      prochainRendezVous:
        dateRdv.toISOString().split('T')[0],
    };

    console.log(body);

    Alert.alert(
      'Succès',
      'Rapport enregistré'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Rapport B2B
        </Text>

        {/* DESCRIPTION */}
        <View style={styles.block}>
          <Text style={styles.label}>
            Description
          </Text>
          <Text>Visite ID : {idVisite}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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