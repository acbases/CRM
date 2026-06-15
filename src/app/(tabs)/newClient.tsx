import React, { useEffect, useState } from 'react';
import NewCorrespondant from '../components/newCorrespondant';

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
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@/config/api';
import { useRouter } from 'expo-router';

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
interface CategorieClient {
  id: number;
  intitule: string;
  statut: string;
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
  const router = useRouter();
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
  const [categorieStatut, setCategorieStatut] = useState<string | null>(null);
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

  const [dataZones, setDataZones] = useState<string[]>([]);
  const [zoneSuggestions, setZoneSuggestions] = useState<string[]>([]);
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);

  const [dataQuartiers, setDataQuartiers] = useState<string[]>([]);
  const [quartierSuggestions, setQuartierSuggestions] = useState<string[]>([]);
  const [showQuartierSuggestions, setShowQuartierSuggestions] = useState(false);

    const [nomCoresp, setNomCoresp] = useState('');
    const [poste, setPoste] = useState('');
    const [contact, setContact] = useState('');
    const [submitted2, setSubmitted2] = useState(false);

  const handleZoneChange = (text: string) => {
    setZone(text);

    if (text.trim().length > 0) {
      const filtered = dataZones.filter(z =>
        z.toLowerCase().includes(text.toLowerCase())
      );

      setZoneSuggestions(filtered);
      setShowZoneSuggestions(true);
    } else {
      setZoneSuggestions([]);
      setShowZoneSuggestions(false);
    }
  };

  const selectZone = (value: string) => {
    setZone(value);        // 👉 juste le texte
    setZoneSuggestions([]);
    setShowZoneSuggestions(false);
  };


  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    fetch(`${BASE_URL}/zone`)
      .then(res => res.json())
      .then(json => setDataZones(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/quartier`)
      .then(res => res.json())
      .then(json => setDataQuartiers(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/categorieClients`)
      .then(res => res.json())
      .then(json => setDataCategorieClient(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/agences`)
      .then(res => res.json())
      .then(json => setDataAgences(Array.isArray(json) ? json : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/fournisseurs`)
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



  const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission localisation refusée');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const lat = location.coords.latitude.toString();
    const lon = location.coords.longitude.toString();

    setLatitude(lat);
    setLongitude(lon);

    console.log('LOCATION AUTO:', lat, lon);
  } catch (err) {
    console.log('LOCATION ERROR:', err);
    alert('Impossible de récupérer la position');
  }
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
          `${BASE_URL}/fournisseur`,
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

  const handleQuartierChange = (text: string) => {
    setQuartier(text);

    if (text.trim().length > 0) {
      const filtered = dataQuartiers.filter(q =>
        q.toLowerCase().includes(text.toLowerCase())
      );

      setQuartierSuggestions(filtered);
      setShowQuartierSuggestions(true);
    } else {
      setQuartierSuggestions([]);
      setShowQuartierSuggestions(false);
    }
  };

  const selectQuartier = (value: string) => {
    setQuartier(value);
    setQuartierSuggestions([]);
    setShowQuartierSuggestions(false);
  };

  /* ===================== SUBMIT ===================== */
const resetForm = () => {
  setNomCoresp('');
  setPoste('');
  setContact('');

  setNom('');
  setLatitude('');
  setLongitude('');
  setZone('');
  setQuartier('');
  setQuartierSuggestions([]);
  setShowQuartierSuggestions(false);

  setAgenceId(null);
  setAgence('');
  setCategorieId(null);
  setCategorie('');

  setFournisseurs([]);
  setError('');
};

const createClient = async () => {
  const clientPayload = {
    nom,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    zone,
    quartier,
    idagence: agenceId,
    idcategorie: categorieId,
  };

  const res = await fetch(`${BASE_URL}/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientPayload),
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  setIdClientCreated(data.id);

  return data.id;
};

const handleSubmit = async () => {
  try {
    setLoading(true);

    // =====================
    // 1. CREATE CLIENT
    // =====================
    const idclient = await createClient();

    console.log("CLIENT CREATED:", idclient);

    // =====================
    // 2. FOURNISSEURS (SAFE VERSION - FIX ERROR TS)
    // =====================
    const resolvedFournisseurs = await Promise.all(
      fournisseurs.map(async (f: Fournisseur) => {
        const nomF = f?.nom?.trim()?.toLowerCase();

        if (!nomF) return null;

        let exist = dataFournisseurs.find(
          (df) =>
            df?.nom?.trim()?.toLowerCase() === nomF
        );

        if (!exist) {
          const res = await fetch(`${BASE_URL}/fournisseur`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nom: f.nom }),
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          exist = await res.json();
        }

        return exist;
      })
    );

    console.log("FOURNISSEURS RESOLVED:", resolvedFournisseurs);

    // =====================
    // 3. LINK FOURNISSEURS
    // =====================
    await Promise.all(
      resolvedFournisseurs
        .filter((f): f is { id: number; nom: string } => !!f && !!f.id)
        .map((f) =>
          fetch(`${BASE_URL}/fournisseurClient`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idclient,
              idfournisseur: f.id,
            }),
          })
        )
    );

    console.log("FOURNISSEURS LINKED");

    // =====================
    // 4. CREATE CORRESPONDANT
    // =====================
    const correspondantRes = await fetch(`${BASE_URL}/correspondant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idclient,
        nom: nomCoresp,
        poste,
        contact,
      }),
    });

    if (!correspondantRes.ok) {
      throw new Error(await correspondantRes.text());
    }

    const correspondant = await correspondantRes.json();
    const idcorrespondant = correspondant.id;

    console.log("CORRESPONDANT CREATED:", correspondant);

    // =====================
    // 5. LINK CORRESPONDANT
    // =====================
    const linkRes = await fetch(`${BASE_URL}/correspondantClient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idclient,
        idcorrespondant,
      }),
    });

    if (!linkRes.ok) {
      throw new Error(await linkRes.text());
    }

    console.log("CORRESPONDANT LINKED");

    // =====================
    // 6. SUCCESS
    // =====================

    // const prospect={
    //   idclient:idclient,
    //   idcategorieClient:categorieId,
    //   zone:zone,
    //   quartier:quartier,
    // }    


    if (categorieStatut==='B2B'){
      router.push({
          pathname: '/rapportB2B',
          params: {
            prospect:idclient,
          },
      });
    }else {
        router.push({
          pathname: '/rapportRetail',
          params: {
            prospect:idclient,
          },
        });
      }

    setSubmitted(true);
    setShowCorrespondant(false);

    setTimeout(() => {
      setSubmitted(false);
      resetForm();
    }, 1200);

  } catch (error: any) {
    console.error("ERROR HANDLE SUBMIT:", error);
    setError(error.message || "Erreur lors de la création");
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
                <Ionicons
                  name="person-outline"
                  size={26}
                  color="#FFFFFF"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Nouveau client
                </Text>
                <Text style={styles.subtitle}>
                  Renseignez les informations du client
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
            <TouchableOpacity
                style={styles.locationBtn}
                onPress={getCurrentLocation}
              >
                <Ionicons name="locate-outline" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Utiliser ma position actuelle
                </Text>
              </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.label}>
                Zone
              </Text>

              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholder="Description de la zone..."
                value={zone}
                onChangeText={handleZoneChange}
              />

              {showZoneSuggestions && zoneSuggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {zoneSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectZone(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Quartier
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nom du quartier"
                value={quartier}
                onChangeText={handleQuartierChange}
                onFocus={() => {
                  if (quartier.trim().length > 0) {
                    setShowQuartierSuggestions(true);
                  }
                }}
              />

              {showQuartierSuggestions && quartierSuggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {quartierSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectQuartier(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
              onPress={() => setShowCorrespondant(true)}
            >
              <Ionicons name="checkmark-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>
                Enregistrer
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
                        setCategorieStatut(item.statut)
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
      <Modal
        visible={showCorrespondant}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCorrespondant(false)}
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
              <View style={styles.header2}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    👨‍💼
                  </Text>
                </View>
  
                <View style={{ flex: 1 }}>
                  <Text style={styles.title2}>
                    Nouveau correspondant
                  </Text>
  
                  <Text style={styles.subtitle2}>
                    Ajouter un contact client
                  </Text>
                </View>
              </View>
  
              {/* Nom */}
              <View style={styles.field2}>
                <Text style={styles.label2}>
                  Nom{' '}
                  <Text style={styles.required2}>
                    *
                  </Text>
                </Text>
  
                <TextInput
                  style={styles.input2}
                  placeholder="Nom du correspondant"
                  value={nomCoresp}
                  onChangeText={setNomCoresp}
                />
              </View>
  
              {/* Poste */}
              <View style={styles.field2}>
                <Text style={styles.label2}>
                  Poste
                </Text>
  
                <TextInput
                  style={styles.input2}
                  placeholder="Ex : Directeur, Responsable achat..."
                  value={poste}
                  onChangeText={setPoste}
                />
              </View>
  
              {/* Contact */}
              <View style={styles.field2}>
                <Text style={styles.label2}>
                  Contact
                </Text>
  
                <TextInput
                  style={styles.input2}
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
                  onPress={() => setShowCorrespondant(false)}
                >
                  <Text style={styles.cancelText}>
                    Annuler
                  </Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveText}>
                    ✓ Enregistrer
                  </Text>
                </TouchableOpacity>
              </View>
  
              {/* Toast */}
              {submitted && (
                <View style={styles.toast2}>
                  <Text style={styles.toastText2}>
                    ✓ Correspondant ajouté
                  </Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {/* <NewCorrespondant
        visible={showCorrespondant}
        prospect={1}
        idclient={idClientCreated}
        onClose={() => setShowCorrespondant(false)}
        onSave={(data) => console.log(data)}
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
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
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  addButton: {
    backgroundColor: '#EF2D24',
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
    color: '#EF2D24',
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
    backgroundColor: C.blue,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
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
  locationBtn: {
  backgroundColor: C.blue2,
  padding: 12,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'center',
},
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

  header2: {
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

  title2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle2: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 14,
  },

  field2: {
    marginBottom: 18,
  },

  label2: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
  },

  required2: {
    color: '#d71f27',
  },

  input2: {
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
    backgroundColor: C.blue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '700',
  },

  toast2: {
    marginTop: 16,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 12,
  },

  toastText2: {
    color: '#166534',
    fontWeight: '700',
    textAlign: 'center',
  },
});