import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  dark: '#1A1A1A',
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
    bg: C.primary,
    route: '/planning',
  },
  {
    title: 'Prospection',
    desc: 'Ajouter un nouveau client',
    icon: 'search-outline',
    bg: '#2C3E50',
    route: '/newClient',
  },
  {
    title: 'Nouvelle Visite',
    desc: ' *Visite non planifiée',
    icon: 'calendar-outline',
    bg: C.grey,
    route: '/newVisite',
  },
];

export default function Accueil() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.firstname ?? '';

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
            Que souhaitez-vous faire aujourd'hui ?
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
