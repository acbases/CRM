import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const DRAWER_WIDTH = 280;

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  lightBg: '#F5F5F7',
  darkText: '#1A1A1A',
  activeItemBg: '#FDEDED',
  iconBg: '#F3F4F6',
  activeIconBg: '#FECACA',
  divider: '#ECECEC',
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type MenuItem = {
  name: string;
  route: string;
  icon: IoniconName;
};

const MENU_ITEMS: MenuItem[] = [
  { name: 'Accueil',         route: '/accueil',    icon: 'home-outline'        },
  { name: 'Clients',         route: '/clients',    icon: 'people-outline'      },
  { name: 'Nouveau Client',  route: '/newClient',  icon: 'person-add-outline'  },
  { name: 'Nouvelle Visite', route: '/newVisite',  icon: 'calendar-outline'    },
  { name: 'Planning',        route: '/planning',   icon: 'list-outline'        },
];

const ADMIN_ITEMS: MenuItem[] = [
  { name: 'Toutes les visites', route: '/allVisite', icon: 'stats-chart-outline' },
];

const PAGE_TITLES: Record<string, string> = {
  accueil:   'Accueil',
  clients:   'Clients',
  newClient: 'Nouveau Client',
  newVisite: 'Nouvelle Visite',
  planning:  'Planning',
  allVisite: 'Toutes les visites',
};

export default function DrawerNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  /* ── Drawer open/close ── */

  const openDrawer = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: 0,    duration: 260, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0.45, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim,   { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0,             duration: 220, useNativeDriver: true }),
    ]).start(() => { setIsOpen(false); cb?.(); });
  };

  const navigate = (route: string) => {
    closeDrawer(() => router.navigate(route as any));
  };

  /* ── Logout ── */

  // Ouvre simplement la modale de confirmation (aucun callback)
  const askLogout = () => {
    setConfirmVisible(true);
  };

  // Appelé quand l'utilisateur confirme "Déconnecter"
  const doLogout = async () => {
    setConfirmVisible(false);
    setIsOpen(false);
    slideAnim.setValue(-DRAWER_WIDTH);
    overlayAnim.setValue(0);
    await logout();
  };

  /* ── Helpers ── */

  const pageTitle = (() => {
    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    return PAGE_TITLES[segment] ?? 'CRM';
  })();

  const isActive = (route: string) => pathname.endsWith(route.replace('/', ''));

  const allItems: MenuItem[] = [
    ...MENU_ITEMS,
    ...(user?.role_crm === 'admin' ? ADMIN_ITEMS : []),
  ];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={C.primary} barStyle="light-content" />

      {/* ─── TOP HEADER ─── */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.hamburger}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.hLine} />
            <View style={styles.hLine} />
            <View style={styles.hLine} />
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />

          <Text style={styles.headerTitle} numberOfLines={1}>
            {pageTitle}
          </Text>
        </View>
      </SafeAreaView>

      {/* ─── SCREEN CONTENT ─── */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* ─── OVERLAY (ferme le drawer en cliquant à côté) ─── */}
      {isOpen && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayAnim }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => closeDrawer()}
          />
        </Animated.View>
      )}

      {/* ─── DRAWER PANEL ─── */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Hero rouge */}
          <View style={styles.drawerHero}>
            <View style={styles.drawerLogoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.drawerAppName}>AlphaCiment CRM</Text>
            {user && (
              <Text style={styles.drawerUserName}>
                {user.firstname} {user.name}
              </Text>
            )}
          </View>

          {/* Menu items */}
          <View style={styles.menuList}>
            {allItems.map((item) => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => navigate(item.route)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.menuIconWrap, active && styles.menuIconWrapActive]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? C.primary : C.grey}
                    />
                  </View>
                  <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                    {item.name}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.drawerFooter}>
            <View style={styles.footerDivider} />
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={askLogout}
              activeOpacity={0.75}
            >
              <View style={styles.logoutIconWrap}>
                <Ionicons name="log-out-outline" size={20} color={C.primary} />
              </View>
              <Text style={styles.logoutLabel}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* ─── MODALE DE CONFIRMATION DÉCONNEXION ─── */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="log-out-outline" size={28} color={C.primary} />
            </View>
            <Text style={styles.modalTitle}>Déconnexion</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={doLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.btnConfirmText}>Déconnecter</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.lightBg },

  /* Header */
  headerSafe: { backgroundColor: C.primary },
  header: {
    height: 56,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hamburger: {
    padding: 8,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hLine: {
    width: 22,
    height: 2.5,
    backgroundColor: C.white,
    marginVertical: 2.5,
    borderRadius: 2,
  },
  headerLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: C.white,
  },
  headerTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },

  /* Content */
  content: { flex: 1, backgroundColor: C.lightBg },

  /* Overlay */
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000',
    zIndex: 10,
  },

  /* Drawer */
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: C.white,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    zIndex: 20,
  },
  drawerHero: {
    backgroundColor: C.primary,
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  drawerLogoWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4,
  },
  drawerLogo: { width: 64, height: 64 },
  drawerAppName: {
    color: C.white, fontSize: 16, fontWeight: '700',
    marginBottom: 4, letterSpacing: 0.3,
  },
  drawerUserName: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

  /* Menu */
  menuList: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 4,
  },
  menuItemActive: { backgroundColor: C.activeItemBg },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.iconBg,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuIconWrapActive: { backgroundColor: C.activeIconBg },
  menuLabel: { fontSize: 14, color: C.darkText, fontWeight: '500', flex: 1 },
  menuLabelActive: { color: C.primary, fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary },

  /* Footer */
  drawerFooter: { paddingHorizontal: 12, paddingBottom: 12 },
  footerDivider: { height: 1, backgroundColor: C.divider, marginBottom: 8 },
  logoutItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12,
  },
  logoutIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  logoutLabel: { fontSize: 14, color: C.primary, fontWeight: '600', flex: 1 },

  /* Modale de confirmation */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: C.darkText,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14, color: C.grey, textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row', gap: 12, width: '100%',
  },
  btnCancel: {
    flex: 1, paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1, borderColor: C.divider,
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 14, color: C.darkText, fontWeight: '600' },
  btnConfirm: {
    flex: 1, paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
  },
  btnConfirmText: { fontSize: 14, color: C.white, fontWeight: '700' },
});
