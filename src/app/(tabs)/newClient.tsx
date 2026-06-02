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
import { KeyboardAwareScrollView }
from 'react-native-keyboard-aware-scroll-view';

interface CategorieClient {
  id: number;
  intitule: string;
}

interface Agence {
  id: number;
  intitule: string;
}

interface Fournisseur {
  id: number;
  nom: string;
  suggestions?: any[];
  showSuggestions?: boolean;
}

export default function NewClientScreen() {
  const [categorie, setCategorie] = useState('');
  const [nom, setNom] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [zone, setZone] = useState('');
  const [agence, setAgence] = useState('');
  const [quartier, setQuartier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [dataCategorieClient, setDataCategorieClient] = useState<CategorieClient[]>([]);
  const [dataAgences, setDataAgences] = useState<Agence[]>([]);
  const [dataFournisseurs, setDataFournisseurs] = useState<Fournisseur[]>([]);

  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [agenceId, setAgenceId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCorrespondant, setShowCorrespondant] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [agencyModalVisible, setAgencyModalVisible] = useState(false);

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([
    {
      id: 1,
      nom: '',
      suggestions: [],
      showSuggestions: false,
    },
  ]);

  const [idClientCreated, setIdClientCreated] = useState<number | null>(null);

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    fetch('https://allapps.alphaciment.com/crm_back/api/categorieClients')
      .then(res => res.json())
      .then(json => setDataCategorieClient(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('https://allapps.alphaciment.com/crm_back/api/agences')
      .then(res => res.json())
      .then(json => setDataAgences(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('https://allapps.alphaciment.com/crm_back/api/fournisseurs')
      .then(res => res.json())
      .then(json => setDataFournisseurs(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ===================== FOURNISSEUR LOGIC ===================== */

  const ajouterFournisseur = () => {
    setFournisseurs(prev => [
      ...prev,
      {
        id: Date.now(),
        nom: '',
        suggestions: [],
        showSuggestions: false,
      },
    ]);
  };

  const supprimerFournisseur = (id: number) => {
    if (fournisseurs.length === 1) return;
    setFournisseurs(prev => prev.filter(f => f.id !== id));
  };

  const mettreAJourFournisseur = (id: number, text: string) => {
    const filtered =
      text.trim().length > 0
        ? dataFournisseurs.filter(f =>
            f.nom.toLowerCase().includes(text.toLowerCase())
          )
        : [];

    setFournisseurs(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              nom: text,
              suggestions: filtered,
              showSuggestions: true,
            }
          : f
      )
    );
  };

  const selectionnerFournisseur = (id: number, nom: string) => {
    setFournisseurs(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              nom,
              suggestions: [],
              showSuggestions: false,
            }
          : f
      )
    );
  };

  const sauvegarderFournisseurs = async () => {
    return Promise.all(
      fournisseurs.map(async f => {
        const exist = dataFournisseurs.find(
          x => x.nom.toLowerCase() === f.nom.toLowerCase()
        );

        if (exist) return exist;

        const res = await fetch(
          'https://allapps.alphaciment.com/crm_back/api/fournisseur',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: f.nom }),
          }
        );

        return await res.json();
      })
    );
  };

  /* ===================== SUBMIT ===================== */

  const handleSubmit = async () => {
    try {
      setLoading(true);

      /* =====================
        1. CREATE CLIENT
      ===================== */
      const clientPayload = {
        nom: nom,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        zone: zone,
        quartier: quartier,
        idagence: agenceId,
        idcategorie: categorieId,
      };

      const clientRes = await fetch(
        'https://allapps.alphaciment.com/crm_back/api/client',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientPayload),
        }
      );

      if (!clientRes.ok) {
        throw new Error(await clientRes.text());
      }

      const clientData = await clientRes.json();
      const idclient = clientData.id;
      setIdClientCreated(clientData.id);

      console.log('CLIENT CREATED:', clientData);

      /* =====================
        2. RESOLVE FOURNISSEURS
        (existing or create)
      ===================== */

      const resolvedFournisseurs = await Promise.all(
        fournisseurs.map(async (f) => {
          // check exist locally
          let exist = dataFournisseurs.find(
            (df) =>
              df.nom.trim().toLowerCase() ===
              f.nom.trim().toLowerCase()
          );

          // if not exist → create
          if (!exist) {
            const res = await fetch(
              'https://allapps.alphaciment.com/crm_back/api/fournisseur',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nom: f.nom }),
              }
            );

            exist = await res.json();
          }

          return exist;
        })
      );

      console.log('FOURNISSEURS RESOLVED:', resolvedFournisseurs);

      /* =====================
        3. LINK CLIENT - FOURNISSEURS
      ===================== */

      await Promise.all(
        resolvedFournisseurs
          .filter((f): f is { id: number; nom: string } => f != null)
          .map((f) => (
              fetch(
              'https://allapps.alphaciment.com/crm_back/api/fournisseurClient',
              {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                  idclient: idclient,
                  idfournisseur: f.id,
                  }),
              }
              )
          )
        )
      );

      /* =====================
        4. SUCCESS UI
      ===================== */

      setSubmitted(true);

      setNom('');
      setLatitude('');
      setLongitude('');
      setZone('');
      setQuartier('');

      setAgenceId(null);
      setAgence('');
      setCategorieId(null);
      setCategorie('');


      // reset fournisseurs
      setFournisseurs([]);

      // reset erreurs
      setError('');

      setTimeout(() => {
        setShowCorrespondant(true);
      }, 500);
    } catch (error: any) {
      console.error('ERROR HANDLE SUBMIT:', error);
      setError(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);



  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
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
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Fournisseurs</Text>
  
              {fournisseurs.map((f, index) => (
                <View key={f.id} style={{ marginBottom: 10 }}>
                  <View style={styles.supplierRow}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        placeholder={`Fournisseur ${index + 1}`}
                        value={f.nom}
                        onChangeText={text =>
                          mettreAJourFournisseur(f.id, text)
                        }
                      />
  
                      {f.showSuggestions && (f.suggestions?.length ?? 0) > 0 && (
                        <View style={styles.suggestionBox}>
                          {(f.suggestions ?? []).map((item: any) => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.suggestionItem}
                              onPress={() =>
                                selectionnerFournisseur(f.id, item.nom)
                              }
                            >
                              <Text>{item.nom}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
  
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => supprimerFournisseur(f.id)}
                    >
                      <Text style={{ fontSize: 20 }}>−</Text>
                    </TouchableOpacity>
  
                    {index === fournisseurs.length - 1 && (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={ajouterFournisseur}
                      >
                        <Text style={{ color: '#fff', fontSize: 20 }}>+</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
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

                {dataCategorieClient.map(
                  (item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.modalItem}
                      onPress={() => {
                        setCategorie(item.intitule);
                        setCategorieId(item.id);
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
                        {item.intitule}
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

                {dataAgences.map((item: Agence) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setAgence(item.intitule);
                      setAgenceId(item.id);
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
                      {item.intitule}
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
      </KeyboardAwareScrollView>
      <NewCorrespondant
        visible={showCorrespondant}
        idclient={idClientCreated}
        onClose={() => setShowCorrespondant(false)}
        onSave={(data) => console.log(data)}
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

    addButton: {
    backgroundColor: '#d71f27',
    padding: 10,
    borderRadius: 10,
  },

  removeButton: {
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 10,
  },

  suggestionBox: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 10,
  marginTop: 5,
  maxHeight: 160,
  overflow: 'hidden',
  elevation: 5, // Android shadow
  zIndex: 999,  // important pour apparaître au-dessus
},

suggestionItem: {
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#f1f1f1',
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