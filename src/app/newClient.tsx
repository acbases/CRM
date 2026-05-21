import React, { useEffect, useState } from 'react';
import NewCorrespondant from './newCorrespondant';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';

interface Fournisseur {
  id: number;
  valeur: string;
}

const categoriesClient = [
  'Particulier',
  'Entreprise',
  'Collectivité',
  'Association',
  'Revendeur',
  'Grossiste',
];

const agences = [
  'Agence Centrale',
  'Agence Nord',
  'Agence Sud',
  'Agence Est',
  'Agence Ouest',
  'Agence Ivandry',
  'Agence Analakely',
];

export default function NewClientScreen() {
  const [categorie, setCategorie] = useState('');
  const [nom, setNom] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [zone, setZone] = useState('');
  const [agence, setAgence] = useState('');
  const [quartier, setQuartier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showCorrespondant, setShowCorrespondant] =
  useState(false);

  const [categoryModalVisible, setCategoryModalVisible] =
    useState(false);
  const [agencyModalVisible, setAgencyModalVisible] =
    useState(false);

  const [fournisseurs, setFournisseurs] = useState<
    Fournisseur[]
  >([{ id: 1, valeur: '' }]);

  const ajouterFournisseur = () => {
    setFournisseurs((prev) => [
      ...prev,
      {
        id: Date.now(),
        valeur: '',
      },
    ]);
  };

  const supprimerFournisseur = (id: number) => {
    if (fournisseurs.length === 1) return;

    setFournisseurs((prev) =>
      prev.filter((f) => f.id !== id)
    );
  };

  const mettreAJourFournisseur = (
    id: number,
    valeur: string
  ) => {
    setFournisseurs((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, valeur } : f
      )
    );
  };

  const handleSubmit = () => {
    console.log({
      categorie,
      nom,
      latitude,
      longitude,
      zone,
      quartier,
      agence,
      fournisseurs,
    });

    setSubmitted(true);

    setTimeout(() => {
    setShowCorrespondant(true);
    }, 500);
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>
                  👤
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Nouveau client
                </Text>
                <Text style={styles.subtitle}>
                  Renseignez les informations du
                  client
                </Text>
              </View>
            </View>

            {/* IDENTITÉ */}
            <Text style={styles.sectionLabel}>
              IDENTITÉ
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Catégorie client{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() =>
                  setCategoryModalVisible(true)
                }
              >
                <Text
                  style={
                    categorie
                      ? styles.selectValue
                      : styles.placeholder
                  }
                >
                  {categorie ||
                    'Sélectionner une catégorie'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Nom{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nom du client"
                value={nom}
                onChangeText={setNom}
              />
            </View>

            <View style={styles.divider} />

            {/* LOCALISATION */}
            <Text style={styles.sectionLabel}>
              LOCALISATION
            </Text>

            <View style={styles.row}>
              <View style={styles.flexField}>
                <Text style={styles.label}>
                  Latitude
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="-18.9137"
                  keyboardType="numeric"
                  value={latitude}
                  onChangeText={setLatitude}
                />
              </View>

              <View style={styles.flexField}>
                <Text style={styles.label}>
                  Longitude
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="47.5361"
                  keyboardType="numeric"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>
            </View>

            <Text style={styles.hint}>
              Coordonnées GPS décimales
              (ex : −18.9137, 47.5361)
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Zone
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                multiline
                numberOfLines={4}
                placeholder="Description de la zone..."
                value={zone}
                onChangeText={setZone}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Quartier
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nom du quartier"
                value={quartier}
                onChangeText={setQuartier}
              />
            </View>

            <View style={styles.divider} />

            {/* COMMERCIAL */}
            <Text style={styles.sectionLabel}>
              COMMERCIAL
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Agence{' '}
                <Text style={styles.required}>
                  *
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() =>
                  setAgencyModalVisible(true)
                }
              >
                <Text
                  style={
                    agence
                      ? styles.selectValue
                      : styles.placeholder
                  }
                >
                  {agence ||
                    'Sélectionner une agence'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* FOURNISSEURS */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Fournisseur(s)
              </Text>

              {fournisseurs.map(
                (fournisseur, index) => (
                  <View
                    key={fournisseur.id}
                    style={styles.supplierRow}
                  >
                    <TextInput
                      style={[
                        styles.input,
                        styles.supplierInput,
                      ]}
                      placeholder={`Fournisseur ${
                        index + 1
                      }`}
                      value={fournisseur.valeur}
                      onChangeText={(text) =>
                        mettreAJourFournisseur(
                          fournisseur.id,
                          text
                        )
                      }
                    />

                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        styles.removeButton,
                      ]}
                      onPress={() =>
                        supprimerFournisseur(
                          fournisseur.id
                        )
                      }
                    >
                      <Text
                        style={
                          styles.iconButtonText
                        }
                      >
                        −
                      </Text>
                    </TouchableOpacity>

                    {index ===
                      fournisseurs.length -
                        1 && (
                      <TouchableOpacity
                        style={[
                          styles.iconButton,
                          styles.addButton,
                        ]}
                        onPress={
                          ajouterFournisseur
                        }
                      >
                        <Text
                          style={
                            styles.addButtonText
                          }
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              )}
            </View>

            {/* BOUTON */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text
                style={styles.submitButtonText}
              >
                ✓ Enregistrer
              </Text>
            </TouchableOpacity>
          </View>

          {/* MODAL CATEGORIE */}
          <Modal
            visible={categoryModalVisible}
            transparent
            animationType="slide"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() =>
                setCategoryModalVisible(false)
              }
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Catégorie client
                </Text>

                {categoriesClient.map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategorie(item);
                        setCategoryModalVisible(
                          false
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.modalItemText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </Pressable>
          </Modal>

          {/* MODAL AGENCE */}
          <Modal
            visible={agencyModalVisible}
            transparent
            animationType="slide"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() =>
                setAgencyModalVisible(false)
              }
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Agence
                </Text>

                {agences.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.modalItem}
                    onPress={() => {
                      setAgence(item);
                      setAgencyModalVisible(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.modalItemText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          {/* TOAST */}
          {submitted && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>
                ✓ Client enregistré avec
                succès
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <NewCorrespondant
        visible={showCorrespondant}
        onClose={() =>
            setShowCorrespondant(false)
        }
        onSave={(data) => {
            console.log(data);
        }}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
  },

  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: '#d71f27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerIconText: {
    fontSize: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },

  sectionLabel: {
    color: '#d71f27',
    fontWeight: '700',
    marginBottom: 16,
  },

  field: {
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  flexField: {
    flex: 1,
  },

  label: {
    marginBottom: 8,
    fontWeight: '600',
  },

  required: {
    color: 'red',
  },

  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  selectButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  placeholder: {
    color: '#9ca3af',
  },

  selectValue: {
    color: '#111827',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },

  hint: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 12,
  },

  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },

  supplierInput: {
    flex: 1,
  },

  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButton: {
    backgroundColor: '#d71f27',
  },

  removeButton: {
    backgroundColor: '#e5e7eb',
  },

  iconButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },

  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },

  submitButton: {
    backgroundColor: '#d71f27',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },

  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalItemText: {
    fontSize: 16,
  },

  toast: {
    marginTop: 20,
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 12,
  },

  toastText: {
    color: '#166534',
    fontWeight: '700',
    textAlign: 'center',
  },
});