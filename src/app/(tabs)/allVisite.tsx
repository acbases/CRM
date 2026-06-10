import React, { useState, useCallback } from 'react';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  green: '#16A34A',
  greenBg: '#DCFCE7',
  orange: '#D97706',
  orangeBg: '#FEF3C7',
  red: '#DC2626',
  redBg: '#FEE2E2',
};

const ITEMS_PER_PAGE = 10;

interface Visite {
  id: number;
  idclient: number;
  idutilisateur: number;
  idcategorie: number;
  idtype: number | null;
  date: string;
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
    categorie_client: { id: number; intitule: string };
  };
  categorie_visite: { id: number; intitule: string };
  type_visite: { id: number; nom: string } | null;
}

type FilterKey = 'all' | 'planned' | 'late' | 'done';

const FILTER_DEFS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'Tous'       },
  { key: 'planned', label: 'Planifiées' },
  { key: 'late',    label: 'En retard'  },
  { key: 'done',    label: 'Faites'     },
];

export default function AllVisite() {
  const [visites, setVisites] = useState<Visite[]>([]);
  const [users, setUsers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchCommercial, setSearchCommercial] = useState('');
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const fetchUser = async (id: number) => {
    try {
      const res = await fetchWithTimeout(
        `https://allapps.alphaciment.com/crm_back/api/user/${id}`
      );
      return await res.json();
    } catch { return null; }
  };

  const loadUsersForVisites = async (list: Visite[]) => {
    const uniqueIds = [...new Set(list.map((v) => v.idutilisateur))];
    const results: Record<number, any> = {};
    await Promise.all(
      uniqueIds.map(async (id) => {
        const u = await fetchUser(id);
        if (u) results[id] = u;
      })
    );
    setUsers(results);
  };

  const loadVisites = async () => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout('https://allapps.alphaciment.com/crm_back/api/visite');
      const json = await res.json();
      if (Array.isArray(json)) {
        const sorted = [...json].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setVisites(sorted);
        setCurrentPage(1);
        loadUsersForVisites(sorted);
      } else {
        setVisites([]);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de charger les visites.');
      setVisites([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadVisites(); }, []));

  const getStatusInfo = (v: Visite) => {
    if (v.statut === 1) return { color: C.green,  bg: C.greenBg,  label: 'VISITE FAITE' };
    if (v.date < today)  return { color: C.red,    bg: C.redBg,    label: 'EN RETARD'    };
    return                      { color: C.orange, bg: C.orangeBg, label: 'PLANIFIÉES'    };
  };

  // ── Filtrage client-side ──
  const filteredVisites = visites.filter((v) => {
    // Filtre statut
    if (activeFilter === 'done'    && !(v.statut === 1))                     return false;
    if (activeFilter === 'late'    && !(v.statut === 0 && v.date < today))   return false;
    if (activeFilter === 'planned' && !(v.statut === 0 && v.date >= today))  return false;
    // Filtre commercial
    if (searchCommercial.trim()) {
      const u = users[v.idutilisateur];
      const name = u ? `${u.firstname ?? ''} ${u.name ?? ''}`.toLowerCase() : '';
      if (!name.includes(searchCommercial.toLowerCase())) return false;
    }
    return true;
  });

  const counts: Record<FilterKey, number> = {
    all:     visites.length,
    planned: visites.filter(v => v.statut === 0 && v.date >= today).length,
    late:    visites.filter(v => v.statut === 0 && v.date < today).length,
    done:    visites.filter(v => v.statut === 1).length,
  };

  const totalPages = Math.max(1, Math.ceil(filteredVisites.length / ITEMS_PER_PAGE));
  const paginatedData = filteredVisites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePress = (item: Visite) => {
    const b2bCategories = [12, 13, 14, 15, 16, 18, 19];
    const isB2B = b2bCategories.includes(item?.client?.idcategorie);
    const route =
      item.statut === 0
        ? isB2B ? '/rapportB2B' : '/scan'
        : isB2B ? '/resultB2B' : '/resultRetail';
    router.push({ pathname: route, params: { idVisite: item.id.toString() } });
  };

  const renderItem = ({ item }: { item: Visite }) => {
    const status = getStatusInfo(item);
    const userInfo = users[item.idutilisateur];
    const commercial = userInfo
      ? `${userInfo.firstname ?? ''} ${userInfo.name ?? ''}`.trim()
      : '…';

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => handlePress(item)}>
        <View style={[styles.card, { borderLeftColor: status.color }]}>
          <View style={styles.cardTop}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.client.nom}
            </Text>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="person-outline" size={13} color={C.grey} style={styles.rowIcon} />
            <Text style={styles.rowText}>{commercial}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={13} color={C.grey} style={styles.rowIcon} />
            <Text style={styles.rowText}>{item.client.categorie_client.intitule}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={13} color={C.grey} style={styles.rowIcon} />
            <Text style={styles.rowText}>{item.client.zone} — {item.client.quartier}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={13} color={C.grey} style={styles.rowIcon} />
            <Text style={styles.rowText}>{item.date.split(' ')[0]}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
            placeholder="Rechercher par commercial..."
            placeholderTextColor={C.grey}
            value={searchCommercial}
            onChangeText={(t) => { setSearchCommercial(t); setCurrentPage(1); }}
          />
          {searchCommercial.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchCommercial(''); setCurrentPage(1); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-outline" size={20} color={C.grey} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterBar}>
        {FILTER_DEFS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, activeFilter === f.key && styles.chipActive]}
            onPress={() => { setActiveFilter(f.key); setCurrentPage(1); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]} numberOfLines={1}>
              {f.label} ({counts[f.key]})
            </Text>
          </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {filteredVisites.length} visite{filteredVisites.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' || searchCommercial ? ' (filtrées)' : ' au total'}
        </Text>
        <Text style={styles.summaryPage}>Page {currentPage}/{totalPages}</Text>
      </View>

      <View style={{ flex: 1 }}>
      {filteredVisites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="stats-chart-outline" size={52} color={C.grey} />
          <Text style={styles.emptyTitle}>
            {visites.length === 0 ? 'Aucune visite' : 'Aucun résultat'}
          </Text>
          <Text style={styles.emptyDesc}>
            {visites.length === 0 ? 'Aucune visite enregistrée.' : 'Modifiez les filtres.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={paginatedData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnOff]}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons
                    name="chevron-back-outline"
                    size={16}
                    color={currentPage === 1 ? C.grey : C.white}
                  />
                  <Text style={[styles.pageBtnTxt, currentPage === 1 && styles.pageBtnTxtOff]}>
                    Précédent
                  </Text>
                </TouchableOpacity>

                <View style={styles.dotRow}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + Math.max(1, currentPage - 2);
                    if (p > totalPages) return null;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[styles.dot, p === currentPage && styles.dotActive]}
                        onPress={() => setCurrentPage(p)}
                      >
                        <Text style={[styles.dotTxt, p === currentPage && styles.dotTxtActive]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnOff]}
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[styles.pageBtnTxt, currentPage === totalPages && styles.pageBtnTxtOff]}>
                    Suivant
                  </Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={currentPage === totalPages ? C.grey : C.white}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightBg },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText: { color: C.grey, fontSize: 14 },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  summaryText: { fontSize: 13, color: C.grey, fontWeight: '500' },
  summaryPage: { fontSize: 13, color: C.grey },

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
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 11, color: C.grey, fontWeight: '600', textAlign: 'center' },
  chipTextActive: { color: C.white },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark },

  list: { padding: 14, paddingBottom: 24 },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.dark,
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  rowIcon: { marginRight: 6, width: 18 },
  rowText: { fontSize: 13, color: C.grey, flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.dark },
  emptyDesc: { fontSize: 14, color: C.grey, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
    gap: 4,
  },
  pageBtnOff: { backgroundColor: '#E5E7EB' },
  pageBtnTxt: { color: C.white, fontWeight: '600', fontSize: 13 },
  pageBtnTxtOff: { color: C.grey },
  dotRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  dotActive: { backgroundColor: C.primary },
  dotTxt: { fontSize: 13, fontWeight: '600', color: C.grey },
  dotTxtActive: { color: C.white },
});
