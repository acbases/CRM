import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { BASE_URL } from '@/config/api';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  border: '#ECECEC',
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
};

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/clients`
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setClients(list);
      setFiltered(list);
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de charger les clients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // Zones uniques extraites des données
  const uniqueZones = [...new Set(clients.map(c => c.zone).filter(Boolean))].sort();

  const applyFilters = (text: string, zone: string | null) => {
    setFiltered(
      clients.filter((c) => {
        const matchName = !text.trim() || c.nom.toLowerCase().includes(text.toLowerCase());
        const matchZone = !zone || c.zone === zone;
        return matchName && matchZone;
      })
    );
  };

  const onSearch = (text: string) => {
    setSearch(text);
    applyFilters(text, activeZone);
  };

  const onZoneFilter = (zone: string | null) => {
    setActiveZone(zone);
    applyFilters(search, zone);
  };

  const onRefresh = () => { setRefreshing(true); fetchClients(); };

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: '/clientDetails', params: { id: item.id } })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.nom.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.clientName} numberOfLines={1}>
          {item.nom}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={C.grey} style={styles.metaIcon} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.zone} — {item.quartier}
          </Text>
        </View>
        {item.latitude && item.longitude ? (
          <View style={styles.metaRow}>
            <Ionicons name="navigate-outline" size={13} color={C.grey} style={styles.metaIcon} />
            <Text style={styles.metaText} numberOfLines={1}>
              {parseFloat(item.latitude).toFixed(4)},{' '}
              {parseFloat(item.longitude).toFixed(4)}
            </Text>
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward-outline" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loaderText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Panel blanc unifié : recherche + chips */}
      <View style={styles.topPanel}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.grey} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
            placeholderTextColor={C.grey}
            value={search}
            onChangeText={onSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-outline" size={20} color={C.grey} />
            </TouchableOpacity>
          )}
        </View>

        {uniqueZones.length > 0 && (
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[styles.chip, !activeZone && styles.chipActive]}
              onPress={() => onZoneFilter(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, !activeZone && styles.chipTextActive]}>
                Toutes zones
              </Text>
            </TouchableOpacity>
            {uniqueZones.map((zone) => (
              <TouchableOpacity
                key={zone}
                style={[styles.chip, activeZone === zone && styles.chipActive]}
                onPress={() => onZoneFilter(activeZone === zone ? null : zone)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activeZone === zone && styles.chipTextActive]}>
                  {zone}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          {(activeZone || search) ? ' (filtrés)' : ''}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={52} color={C.grey} />
            <Text style={styles.emptyTitle}>Aucun client trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightBg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { color: C.grey, fontSize: 14 },
  topPanel: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark },

  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: C.white,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 12, color: C.grey, fontWeight: '600' },
  chipTextActive: { color: C.white },

  countBar: { paddingHorizontal: 16, paddingVertical: 8 },
  countText: { fontSize: 12, color: C.grey, fontWeight: '500' },
  list: { paddingHorizontal: 14, paddingBottom: 24 },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.primary },
  cardBody: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaIcon: { marginRight: 5 },
  metaText: { fontSize: 12, color: C.grey, flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, color: C.grey, fontWeight: '600' },
});
