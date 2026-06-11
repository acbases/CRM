import React, { useEffect, useState } from 'react';


import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { BASE_URL } from '@/config/api';

interface NewCorrespondantProps {
  visible: boolean;
  prospect: number | null;
  idclient: number | null;
  onClose: () => void;
  onSave?: (data: { id: number; nom: string; poste: string; contact: string }) => void;
}

export default function NewCorrespondant({
  visible,
  prospect,
  onClose,
  onSave,
  idclient,
}: NewCorrespondantProps) {
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!nom.trim() || !idclient) return;

    try {
      const payload = {
        idclient: idclient,
        nom: nom,
        poste: poste,
        contact: contact,
      };

      const res = await fetch(
        `${BASE_URL}/correspondant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const correspondant = await res.json();
      const idcorrespondant = correspondant.id;

      console.log('CORRESPONDANT CREATED:', correspondant);

      // 👉 liaison client - correspondant
      await fetch(
        `${BASE_URL}/correspondantClient`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idclient: idclient,
            idcorrespondant: idcorrespondant,
          }),
        }
      );

      onSave?.(correspondant);

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        resetForm();
        onClose();
      }, 1200);

      if (prospect === 1) {
        if (!user?.id) {
          Alert.alert('Erreur', 'Utilisateur non connecté');
          return;
        }

        try {
          const body = {
            idclient: idclient,
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
              body: JSON.stringify(body),
            }
          );

          console.log('Status:', response.status);

          const text = await response.text();
          console.log('Réponse brute:', text);

          let result;
          
          console.log('TEXT VISITE :', text);

          try {
            result = JSON.parse(text);
            console.log('RESULTAT VISITE :', result);
          } catch {
            throw new Error('Réponse serveur invalide');
          }

          if (!response.ok) {
            throw new Error(result.message || 'Erreur insertion visite');
          }

          const idVisite = result.id; // à adapter selon la structure retournée

          resetForm();

          Alert.alert('Succès', 'Visite enregistrée avec succès');

          router.push({
            pathname: '/rapportRetail',
            params: {
              idClient: idclient,
              idVisite: idVisite,
            },
          });
        } catch (err: any) {
          Alert.alert('Erreur', err.message);
        }
      }
    } catch (error) {
      console.error('ERROR SAVE CORRESPONDANT:', error);
    }
  };

  const resetForm = () => {
    setNom('');
    setPoste('');
    setContact('');
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          style={styles.keyboardContainer}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  👨‍💼
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Nouveau correspondant
                </Text>

                <Text style={styles.subtitle}>
                  Ajouter un contact client
                </Text>
              </View>
            </View>

            {/* Nom */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Nom{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nom du correspondant"
                value={nom}
                onChangeText={setNom}
              />
            </View>

            {/* Poste */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Poste
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ex : Directeur, Responsable achat..."
                value={poste}
                onChangeText={setPoste}
              />
            </View>

            {/* Contact */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Contact
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Téléphone ou email"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>
                  ✓ Enregistrer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Toast */}
            {submitted && (
              <View style={styles.toast}>
                <Text style={styles.toastText}>
                  ✓ Correspondant ajouté
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  keyboardContainer: {
    width: '100%',
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#d71f27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 14,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
  },

  required: {
    color: '#d71f27',
  },

  input: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#d71f27',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '700',
  },

  toast: {
    marginTop: 16,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 12,
  },

  toastText: {
    color: '#166534',
    fontWeight: '700',
    textAlign: 'center',
  },
});