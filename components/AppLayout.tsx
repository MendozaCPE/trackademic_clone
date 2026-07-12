import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useState, useRef } from 'react';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
  {
    id: 1,
    sender: 'Jason C. Magsino',
    message: "New classwork 'API Integration and Backend Connectivity – Quiz' has been added.",
    date: '7/11/2026',
  },
  {
    id: 2,
    sender: 'Jason C. Magsino',
    message: "New classwork 'Laboratory Exam AppDev - Prelim' has been added.",
    date: '7/10/2026',
  },
  {
    id: 3,
    sender: 'Jason C. Magsino',
    message: "New classwork 'Final Project Presentation' has been added.",
    date: '6/25/2026',
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string[];
}

const DRAWER_WIDTH = 220;

export default function AppLayout({ children, title, breadcrumb }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const pathname = usePathname();

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const navItems = [
    { label: 'Home', icon: 'home-outline' as const, route: '/(tabs)/home' },
    { label: 'Class', icon: 'school-outline' as const, route: '/(tabs)/classes' },
    { label: 'My Performance', icon: 'bar-chart-outline' as const, route: '/(tabs)/performance' },
    { label: 'Profile', icon: 'person-outline' as const, route: '/(tabs)/profile' },
  ];

  const isActive = (route: string) => {
    const seg = route.replace('/(tabs)', '');
    return pathname.includes(seg);
  };

  const navigate = (route: string) => {
    closeDrawer();
    setTimeout(() => router.push(route as any), 50);
  };

  return (
    <View style={styles.root}>
      {/* Status bar spacer */}
      <View style={styles.statusBarSpacer} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.logoText}>Trackademic</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => { setNotifOpen(!notifOpen); if (drawerOpen) closeDrawer(); }}
          >
            <Ionicons name="notifications-outline" size={22} color="#555" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>32</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigate('/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              Christian Paul Mendoza
            </Text>
            <Text style={styles.profileRole}>(Student)</Text>
            <Ionicons name="chevron-down" size={14} color="#555" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main body */}
      <View style={styles.body}>
        {/* Content */}
        <View style={styles.content}>
          {(title || breadcrumb) && (
            <View style={styles.pageHeader}>
              {title && <Text style={styles.pageTitle}>{title}</Text>}
              {breadcrumb && breadcrumb.length > 0 && (
                <View style={styles.breadcrumb}>
                  {breadcrumb.map((crumb, i) => (
                    <View key={i} style={styles.breadcrumbItem}>
                      {i > 0 && <Text style={styles.breadcrumbSep}> / </Text>}
                      <Text
                        style={[
                          styles.breadcrumbText,
                          i === breadcrumb.length - 1 && styles.breadcrumbActive,
                        ]}
                      >
                        {crumb}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          {children}
        </View>
      </View>

      {/* Notifications Panel */}
      {notifOpen && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setNotifOpen(false)}
          />
          <View style={styles.notifPanel}>
            <View style={styles.notifPanelHeader}>
              <Text style={styles.notifPanelTitle}>Notifications</Text>
              <View style={styles.notifNewBadge}>
                <Text style={styles.notifNewBadgeText}>New</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {NOTIFICATIONS.map((n) => (
                <View key={n.id} style={styles.notifItem}>
                  <View style={styles.notifAvatar}>
                    <Ionicons name="person" size={18} color="#fff" />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifSender}>{n.sender}</Text>
                    <Text style={styles.notifMessage}>{n.message}</Text>
                    <Text style={styles.notifDate}>{n.date}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      {/* Overlay */}
      {drawerOpen && (
        <Pressable style={styles.overlay} onPress={closeDrawer} />
      )}

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerNavLabel}>Navigation</Text>
        </View>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.drawerItem, active && styles.drawerItemActive]}
              onPress={() => navigate(item.route)}
            >
              <Ionicons
                name={item.icon}
                size={17}
                color={active ? '#fff' : '#aab'}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.drawerItemText, active && styles.drawerItemTextActive]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={active ? '#fff' : '#667'}
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  statusBarSpacer: {
    height: STATUS_BAR_HEIGHT,
    backgroundColor: '#fff',
  },
  header: {
    height: 52,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    zIndex: 10,
  },
  menuBtn: {
    padding: 4,
    marginRight: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIconWrap: {
    width: 28,
    height: 28,
    backgroundColor: '#1a2e4a',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2e4a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 10,
  },
  notifBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6c8096',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    maxWidth: 100,
  },
  profileRole: {
    fontSize: 11,
    color: '#888',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexWrap: 'wrap',
    gap: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbSep: {
    color: '#aaa',
    fontSize: 12,
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#17a2b8',
  },
  breadcrumbActive: {
    color: '#666',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#2c3e50',
    zIndex: 30,
    paddingTop: STATUS_BAR_HEIGHT + 52,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3d5166',
    marginBottom: 4,
  },
  drawerNavLabel: {
    color: '#7a8fa6',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  drawerItemActive: {
    backgroundColor: '#17a2b8',
  },
  drawerItemText: {
    color: '#bbc',
    fontSize: 14,
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Notifications panel
  notifPanel: {
    position: 'absolute',
    top: STATUS_BAR_HEIGHT + 52,
    right: 12,
    width: 300,
    maxHeight: 380,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 50,
    overflow: 'hidden',
  },
  notifPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notifPanelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  notifNewBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  notifNewBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  notifAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifSender: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  notifMessage: {
    fontSize: 12,
    color: '#555',
    lineHeight: 17,
  },
  notifDate: {
    fontSize: 11,
    color: '#aaa',
  },
});
