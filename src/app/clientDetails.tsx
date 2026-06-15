import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/PageHeader';
import NewCorrespondant from './components/newCorrespondant';
import NewFournisseur from './components/newFournisseur';
import EditCorrespondant from './components/editCorrespondant';
import EditFournisseur from './components/editFournisseur';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '../config/api';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  border: '#ECECEC',
  green: '#16A34A',
  greenBg: '#DCFCE7',
  redBg: '#FEE2E2',
  blue:'#126bc4',
  blue2:'#509597',
};

type Client = {
  id: number;
  nom: string;
  latitude: string;
  longitude: string;
  zone: string;
  quartier: string;
  idagence: number;
  idcategorie: number;
  status_qrcode: boolean;
  statut: number;
  agence?: { id: number; intitule: string };
  categorie_client?: { id: number; intitule: string; statut: string };
};

export default function ClientDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [correspondants, setCorrespondants] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [showCorrespondant, setShowCorrespondant] = useState(false);
  const [showFournisseur, setShowFournisseur] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editVisibleF, setEditVisibleF] = useState(false);
  const [selectedIdF, setSelectedIdF] = useState<number | null>(null);
  const [selectedFournisseurClientId, setSelectedFournisseurClientId] = useState<number | null>(null);

  // ── Nouvelle visite ──
  const { user } = useAuth();
  const [showVisiteModal, setShowVisiteModal] = useState(false);
  const [visiteNature, setVisiteNature] = useState('');
  const [visiteNatureId, setVisiteNatureId] = useState<number | null>(null);
  const [visiteType, setVisiteType] = useState('');
  const [visiteTypeId, setVisiteTypeId] = useState<number | null>(null);
  const [visiteObjectif, setVisiteObjectif] = useState('');
  const [categorieVisites, setCategorieVisites] = useState<any[]>([]);
  const [typeVisites, setTypeVisites] = useState<any[]>([]);
  const [modalNatureVisite, setModalNatureVisite] = useState(false);
  const [modalTypeVisite, setModalTypeVisite] = useState(false);

  const fetchClient = async () => {
    try {
      const res = await fetch(`${BASE_URL}/client/${id}`);
      const data = await res.json();
      setClient(data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger le client');
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrespondants = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/correspondantClientByIdClient/${id}`
      );
      const data = await res.json();
      setCorrespondants(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/fournisseurClientByIdClient/${id}`
      );
      const data = await res.json();
      setFournisseurs(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchClient();
    fetchCorrespondants();
    fetchFournisseurs();
    // Charger les listes pour la modal "Nouvelle Visite"
    fetch(`${BASE_URL}/categorieVisites`)
      .then(r => r.json()).then(j => setCategorieVisites(Array.isArray(j) ? j : [])).catch(() => {});
    fetch(`${BASE_URL}/typeVisites`)
      .then(r => r.json()).then(j => setTypeVisites(Array.isArray(j) ? j : [])).catch(() => {});
  }, [id]);

  const handleSubmitVisite = async () => {
    if (!visiteNatureId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une nature de visite');
      return;
    }
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const body = {
        idclient: client?.id,
        idutilisateur: user.id,
        idcategorie: visiteNatureId,
        idtype: visiteTypeId ?? null,
        date: `${today} 00:00:00`,
        statut: 0,
        type: 1,
        object: visiteObjectif || null,
      };
      const res = await fetch(`${BASE_URL}/visite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let result;
            
      console.log('TEXT VISITE :', text);

      try {
      result = JSON.parse(text);
      console.log('RESULTAT VISITE :', result);
      } catch {
      throw new Error('Réponse serveur invalide');
      }

      if (!res.ok) {
      throw new Error(result.message || 'Erreur insertion visite');
      }

      const idVisite = result.id; // à adapter selon la structure retournée

      
      Alert.alert('Succès', 'Visite créée avec succès');
      setShowVisiteModal(false);
      setVisiteNature(''); setVisiteNatureId(null);
      setVisiteType(''); setVisiteTypeId(null);
      setVisiteObjectif('');
      fetchClient();
      fetchCorrespondants();
      fetchFournisseurs();

      const route: '/scan' | '/rapportB2B' =
        client?.statut !== 0 &&
        client?.categorie_client?.statut === 'B2B'
          ? '/rapportB2B'
          : '/scan';

      router.push({
        pathname: route,
        params: {
          idVisite: idVisite,
          idClient: client?.id,
        },
      });
      } catch (err: any) {
        Alert.alert('Erreur', err.message ?? 'Erreur lors de la création');
      }
    };

  const deleteCorrespondant = async (itemId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/correspondantClient/${itemId}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      if (!response.ok) {
        Alert.alert('Erreur', 'Suppression impossible');
        return;
      }
      fetchCorrespondants();
      Alert.alert('Succès', 'Correspondant supprimé');
    } catch {
      Alert.alert('Erreur', 'Erreur lors de la suppression');
    }
  };

  const confirmDeleteCorrespondant = (itemId: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer ce correspondant ?')) deleteCorrespondant(itemId);
    } else {
      Alert.alert('Suppression', 'Supprimer ce correspondant ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteCorrespondant(itemId) },
      ]);
    }
  };

  const deleteFournisseur = async (itemId: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/fournisseurClient/${itemId}`,
        { method: 'DELETE', headers: { Accept: 'application/json' } }
      );
      if (!response.ok) {
        Alert.alert('Erreur', 'Suppression impossible');
        return;
      }
      fetchFournisseurs();
      Alert.alert('Succès', 'Fournisseur supprimé');
    } catch {
      Alert.alert('Erreur', 'Erreur lors de la suppression');
    }
  };

  const confirmDeleteFournisseur = (itemId: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer ce fournisseur ?')) deleteFournisseur(itemId);
    } else {
      Alert.alert('Suppression', 'Supprimer ce fournisseur ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteFournisseur(itemId) },
      ]);
    }
  };

  const isDisabledNewVisite =
    !!client &&
    String(client.status_qrcode) === 'false' &&
    client?.categorie_client?.statut === 'RETAIL';

  console.log('status_qrcode:', client?.status_qrcode);
  console.log('disabled:', isDisabledNewVisite);

  if (loading) {
    return (
      <View style={styles.safe}>
        <PageHeader title="Détails client" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.safe}>
        <PageHeader title="Détails client" />
        <View style={styles.loader}>
          <Ionicons name="alert-circle-outline" size={48} color={C.grey} />
          <Text style={styles.loaderText}>Client introuvable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <PageHeader title={client.nom} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Infos client ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Informations</Text>

          <InfoRow icon="location-outline" label="Zone" value={client.zone} />
          <InfoRow icon="map-outline" label="Quartier" value={client.quartier} />
          <InfoRow icon="business-outline" label="Agence" value={client.agence?.intitule ?? '—'} />
          <InfoRow icon="pricetag-outline" label="Catégorie" value={client.categorie_client?.intitule ?? '—'} />
          <InfoRow icon="navigate-outline" label="Latitude" value={client.latitude} />
          <InfoRow icon="navigate-outline" label="Longitude" value={client.longitude} />

          <View style={styles.qrRow}>
            <View
              style={[
                styles.qrBadge,
                { backgroundColor: client.status_qrcode ? C.greenBg : C.redBg },
              ]}
            >
              <Ionicons
                name={client.status_qrcode ? 'qr-code-outline' : 'qr-code-outline'}
                size={14}
                color={client.status_qrcode ? C.green : C.primary}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.qrBadgeText,
                  { color: client.status_qrcode ? C.green : C.primary },
                ]}
              >
                {client.status_qrcode ? 'QR ACTIVÉ' : 'QR DÉSACTIVÉ'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Bouton Nouvelle Visite ── */}
        <TouchableOpacity
          style={[
            styles.newVisiteBtn,
            isDisabledNewVisite && { backgroundColor: '#D1D5DB', opacity: 0.6 }
          ]}
          onPress={() => {
            if (isDisabledNewVisite) return;
            setShowVisiteModal(true);
          }}
          activeOpacity={isDisabledNewVisite ? 1 : 0.85}
          disabled={isDisabledNewVisite}   // 👈 IMPORTANT
          
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.newVisiteBtnText}>
            + Nouvelle visite
          </Text>
        </TouchableOpacity>

        {/* ── Correspondants ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Correspondants</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowCorrespondant(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-outline" size={20} color={C.white} />
            </TouchableOpacity>
          </View>

          {correspondants.length === 0 ? (
            <Text style={styles.empty}>Aucun correspondant</Text>
          ) : (
            correspondants.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <Ionicons name="person-outline" size={14} color={C.grey} style={styles.itemIcon} />
                  <Text style={styles.itemName}>{item.correspondant?.nom}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="briefcase-outline" size={13} color={C.grey} style={styles.itemIcon} />
                  <Text style={styles.itemMeta}>{item.correspondant?.poste}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Ionicons name="call-outline" size={13} color={C.grey} style={styles.itemIcon} />
                  <Text style={styles.itemMeta}>{item.correspondant?.contact}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => { setSelectedId(item.correspondant?.id); setEditVisible(true); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color={C.dark} />
                    <Text style={styles.editBtnText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteCorrespondant(item.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color={C.white} />
                    <Text style={styles.deleteBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── Fournisseurs ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Fournisseurs</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowFournisseur(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-outline" size={20} color={C.white} />
            </TouchableOpacity>
          </View>

          {fournisseurs.length === 0 ? (
            <Text style={styles.empty}>Aucun fournisseur</Text>
          ) : (
            fournisseurs.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <Ionicons name="cube-outline" size={14} color={C.grey} style={styles.itemIcon} />
                  <Text style={styles.itemName}>{item.fournisseur?.nom || 'Sans nom'}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => { setSelectedIdF(item.fournisseur?.id); setSelectedFournisseurClientId(item.id); setEditVisibleF(true); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color={C.dark} />
                    <Text style={styles.editBtnText}>Modifier</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDeleteFournisseur(item.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color={C.white} />
                    <Text style={styles.deleteBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Modal Nouvelle Visite ── */}
      <Modal visible={showVisiteModal} transparent animationType="slide" onRequestClose={() => setShowVisiteModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowVisiteModal(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Nouvelle visite — {client?.nom}</Text>

              {/* Nature */}
              <Text style={styles.sheetLabel}>
                <Ionicons name="document-text-outline" size={13} color={C.grey} /> Nature de la visite *
              </Text>
              <TouchableOpacity style={styles.sheetSelect} onPress={() => setModalNatureVisite(true)}>
                <Text style={[styles.sheetSelectText, !visiteNature && { color: C.grey }]}>
                  {visiteNature || 'Sélectionner...'}
                </Text>
                <Ionicons name="chevron-down-outline" size={14} color={C.grey} />
              </TouchableOpacity>

              {/* Type */}
              <Text style={styles.sheetLabel}>
                <Ionicons name="pricetag-outline" size={13} color={C.grey} /> Type de visite
              </Text>
              <TouchableOpacity style={styles.sheetSelect} onPress={() => setModalTypeVisite(true)}>
                <Text style={[styles.sheetSelectText, !visiteType && { color: C.grey }]}>
                  {visiteType || 'Sélectionner...'}
                </Text>
                <Ionicons name="chevron-down-outline" size={14} color={C.grey} />
              </TouchableOpacity>

              {/* Objectif */}
              <Text style={styles.sheetLabel}>
                <Ionicons name="flag-outline" size={13} color={C.grey} /> Objectif
              </Text>
              <TextInput
                style={styles.sheetTextArea}
                placeholder="Décrire l'objectif..."
                placeholderTextColor={C.grey}
                multiline
                numberOfLines={3}
                value={visiteObjectif}
                onChangeText={setVisiteObjectif}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.sheetSubmitBtn} onPress={handleSubmitVisite} activeOpacity={0.85}>
                <Ionicons name="checkmark-outline" size={18} color={C.white} style={{ marginRight: 6 }} />
                <Text style={styles.sheetSubmitText}>Créer la visite</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Nature picker */}
      <Modal visible={modalNatureVisite} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalNatureVisite(false)}>
          <View style={styles.pickerSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Nature de la visite</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categorieVisites.map(item => (
                <TouchableOpacity key={item.id} style={styles.pickerItem} onPress={() => { setVisiteNature(item.intitule); setVisiteNatureId(item.id); setModalNatureVisite(false); }}>
                  <Text style={styles.pickerItemText}>{item.intitule}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Type picker */}
      <Modal visible={modalTypeVisite} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalTypeVisite(false)}>
          <View style={styles.pickerSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Type de visite</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {typeVisites.map(item => (
                <TouchableOpacity key={item.id} style={styles.pickerItem} onPress={() => { setVisiteType(item.nom); setVisiteTypeId(item.id); setModalTypeVisite(false); }}>
                  <Text style={styles.pickerItemText}>{item.nom}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ── Modals ── */}
      <NewCorrespondant
        visible={showCorrespondant}
        prospect={0}
        idclient={client?.id ?? null}
        onClose={() => setShowCorrespondant(false)}
        onSave={async () => {
          setShowCorrespondant(false);
          fetchCorrespondants();
        }}
      />
      <NewFournisseur
        visible={showFournisseur}
        idclient={client?.id ?? null}
        onClose={() => setShowFournisseur(false)}
        onSave={async () => {
          setShowFournisseur(false);
          fetchFournisseurs();
        }}
      />
      <EditCorrespondant
        visible={editVisible}
        idcorrespondant={selectedId}
        onClose={() => setEditVisible(false)}
        onSave={fetchCorrespondants}
      />
      <EditFournisseur
        visible={editVisibleF}
        idfournisseur={selectedIdF}
        idfournisseurclient={selectedFournisseurClientId}
        idclient={client?.id ?? null}
        onClose={() => setEditVisibleF(false)}
        onSave={fetchFournisseurs}
      />
    </View>
  );
}

/* ── Helper component ── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color="#88898E" style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F7' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { color: '#88898E', fontSize: 14 },
  scroll: { padding: 14, paddingBottom: 32 },

  /* Bouton nouvelle visite */
  newVisiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF2D24',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#EF2D24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  newVisiteBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  /* Modal nouvelle visite */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#E5E7EB',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  sheetLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, marginTop: 12 },
  sheetSelect: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  sheetSelectText: { flex: 1, fontSize: 14, color: '#1A1A1A' },
  sheetTextArea: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, minHeight: 80, fontSize: 14, color: '#1A1A1A',
  },
  sheetSubmitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.blue, borderRadius: 14, paddingVertical: 15,
    marginTop: 20,
  },
  sheetSubmitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  /* Picker modal */
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '60%',
  },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  pickerItemText: { fontSize: 15, color: '#1A1A1A' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF2D24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EF2D24',
    justifyContent: 'center', alignItems: 'center',
  },

  /* Client info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: { marginRight: 10, width: 20 },
  infoLabel: { width: 90, fontSize: 13, color: '#88898E', fontWeight: '500' },
  infoValue: { flex: 1, fontSize: 13, color: '#1A1A1A', fontWeight: '500' },

  qrRow: { marginTop: 12 },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  qrBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  /* Item cards (correspondant / fournisseur) */
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EF2D24',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemIcon: { marginRight: 7, width: 18 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  itemMeta: { fontSize: 13, color: '#88898E' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: { fontSize: 12, color: '#1A1A1A', fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EF2D24',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },

  empty: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
});
