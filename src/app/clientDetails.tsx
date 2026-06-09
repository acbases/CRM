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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/PageHeader';
import NewCorrespondant from './components/newCorrespondant';
import NewFournisseur from './components/newFournisseur';
import EditCorrespondant from './components/editCorrespondant';
import EditFournisseur from './components/editFournisseur';

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
  agence?: { id: number; intitule: string };
  categorie_client?: { id: number; intitule: string };
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

  const fetchClient = async () => {
    try {
      const res = await fetch(`https://allapps.alphaciment.com/crm_back/api/client/${id}`);
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
        `https://allapps.alphaciment.com/crm_back/api/correspondantClientByIdClient/${id}`
      );
      const data = await res.json();
      setCorrespondants(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/fournisseurClientByIdClient/${id}`
      );
      const data = await res.json();
      setFournisseurs(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchClient();
    fetchCorrespondants();
    fetchFournisseurs();
  }, [id]);

  const deleteCorrespondant = async (itemId: number) => {
    try {
      const response = await fetch(
        `https://allapps.alphaciment.com/crm_back/api/correspondantClient/${itemId}`,
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
        `https://allapps.alphaciment.com/crm_back/api/fournisseurClient/${itemId}`,
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
                    onPress={() => { setSelectedIdF(item.fournisseur?.id); setEditVisibleF(true); }}
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

      {/* ── Modals ── */}
      <NewCorrespondant
        visible={showCorrespondant}
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
