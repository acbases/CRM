import React, { useState,useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';
import { BASE_URL } from '@/config/api';
const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
  blue:'#4a97e4',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type ActionItem = {
  title: string;
  desc: string;
  icon: IoniconName;
  bg: string;
  route: string;
};

const ACTIONS: ActionItem[] = [
  {
    title: 'Visite',
    desc: 'Gérer mes visites planifiées',
    icon: 'navigate-outline',
    bg: '#4a97e4',
    route: '/planning',
  },
  {
    title: 'Prospection',
    desc: 'Ajouter un nouveau client',
    icon: 'search-outline',
    bg: '#30669c',
    route: '/newClient',
  },
  {
    title: 'Nouvelle Visite',
    desc: ' *Visite non planifiée',
    icon: 'calendar-outline',
    bg: '#214768',
    route: '/newVisite',
  },
];
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

export default function Accueil() {
  const router = useRouter();
  const { user } = useAuth();
  const [visites, setVisites] = useState<Visite[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVisitesStatut0, setTotalVisitesStatut0] = useState(0);

  const firstName = user?.firstname ?? '';

  const countVisitesStatut0 = (visites: any[]) => {
    return visites.filter(v => v.statut === 0).length;
  };

  const loadVisites = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetchWithTimeout(
        `${BASE_URL}/visiteByIdUtilisateur/${user.id}`
      );
      const json = await res.json();
      if (Array.isArray(json)) {
        const sorted = [...json].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setVisites(sorted);

        const totalStatut0 = countVisitesStatut0(sorted);
        console.log('Visites statut 0 :', totalStatut0);

        setTotalVisitesStatut0(totalStatut0);
      } else {
        setVisites([]);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Impossible de charger le planning.');
      setVisites([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadVisites(); }, [user?.id]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.greeting}>
            Bonjour{firstName ? `, ${firstName}` : ''} !
          </Text>
          <Text style={styles.subtitle}>
            Vous avez actuellement{' '}
            <Text style={styles.highlightCount}>
              {totalVisitesStatut0}
            </Text>{' '}
            visite(s) planifiée(s).
          </Text>
        </View>

        {/* Action cards */}
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.route}
              style={[styles.actionCard, { backgroundColor: a.bg }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.85}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name={a.icon} size={24} color={C.white} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.actionDesc}>{a.desc}</Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.lightBg },
  scroll: { padding: 20, paddingBottom: 40 },
  welcomeCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  highlightCount: {
  color: '#06a046',
  fontWeight: '700',
  fontSize: 18,
},
  logo: { width: 96, height: 96, marginBottom: 16 },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.grey,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: { gap: 14 },
  actionCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionText: { flex: 1 },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.white,
    marginBottom: 3,
  },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
});
