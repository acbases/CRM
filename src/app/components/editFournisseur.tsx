import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

type Props = {
  visible: boolean;
  idfournisseur: number | null;
  onClose: () => void;
  onSave: () => void;
};

export default function EditFournisseur({
  visible,
  idfournisseur,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [nom, setNom] = useState('');


  // ===================== LOAD DATA =====================
useEffect(() => {
  if (!idfournisseur || !visible) return;

  const fetchData = async () => {
    try {
      setLoadingFetch(true);

      const res = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/fournisseur/${idfournisseur}`
      );

      const json = await res.json();

      console.log('FOURNISSEUR LOADED:', json);

      setNom(json.nom ?? '');

    } catch (err) {
      console.log('LOAD ERROR:', err);
      Alert.alert('Erreur', 'Impossible de charger le fournisseur');
    } finally {
      setLoadingFetch(false);
    }
  };

  fetchData();
}, [idfournisseur, visible]);

  // ===================== UPDATE =====================
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/fournisseur/${idfournisseur}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            nom,
          }),
        }
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      Alert.alert('Succès', 'Fournisseur modifié avec succès');

      onSave();
      onClose();
    } catch (err: any) {
      console.log('UPDATE ERROR:', err);
      Alert.alert('Erreur', err.message || 'Erreur modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Modifier fournisseur</Text>

          {loadingFetch  ? (
            <ActivityIndicator size="large" color="#d71f27" />
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={nom}
                onChangeText={setNom}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleUpdate}
              >
                <Text style={styles.saveText}>✔ Sauvegarder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: '#d71f27',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancelBtn: {
    padding: 12,
    alignItems: 'center',
  },

  cancelText: {
    color: '#333',
  },
});