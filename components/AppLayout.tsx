import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Pressable, Platform, StatusBar, ScrollView, Dimensions, PanResponder, Image,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAllNotificationsRead, Notification, BASE_URL } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const DRAWER_WIDTH = 260;
const SWIPE_ZONE   = 40;

const NAV_ITEMS = [
  { label: 'Home',        icon: 'home-outline'      as const, route: '/(tabs)/home'        },
  { label: 'Class',       icon: 'school-outline'    as const, route: '/(tabs)/classes'     },
  { label: 'Schedule',    icon: 'calendar-outline'  as const, route: '/(tabs)/schedule'    },
  { label: 'Performance', icon: 'bar-chart-outline' as const, route: '/(tabs)/performance' },
  { label: 'Profile',     icon: 'person-outline'    as const, route: '/(tabs)/profile'     },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string[];
}

export default function AppLayout({ children, title, breadcrumb }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const notifAnim = useRef(new Animated.Value(0)).current;
  const pathname  = usePathname();

  useEffect(() => {
    getNotifications()
      .then(d => { setNotifs(d.notifications); setUnreadCount(d.unread_count); })
      .catch(() => {});
  }, []);

  // ── Drawer swipe PanResponder ──────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        const isHorizontal = Math.abs(g.dx) > Math.abs(g.dy);
        if (!drawerOpen && isHorizontal && g.moveX > (SCREEN_WIDTH - SWIPE_ZONE) && g.dx < -10) return true;
        if ( drawerOpen && isHorizontal && g.dx > 10) return true;
        return false;
      },
      onPanResponderMove: (_, g) => {
        if (!drawerOpen) slideAnim.setValue(Math.max(0, DRAWER_WIDTH + g.dx));
        else             slideAnim.setValue(Math.max(0, g.dx));
      },
      onPanResponderRelease: (_, g) => {
        if (!drawerOpen) { if (g.dx < -50) openDrawer(); else closeDrawer(); }
        else             { if (g.dx >  50) closeDrawer(); else openDrawer(); }
      },
    })
  ).current;

  // ── Drawer Controls ────────────────────────────────────────────────────────
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, { toValue: DRAWER_WIDTH, duration: 200, useNativeDriver: true })
      .start(() => setDrawerOpen(false));
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  const openNotif = () => {
    setNotifOpen(true);
    Animated.spring(notifAnim, { toValue: 1, useNativeDriver: true, tension: 110, friction: 13 }).start();
    markAllNotificationsRead().then(() => setUnreadCount(0)).catch(() => {});
  };

  const closeNotif = () => {
    Animated.timing(notifAnim, { toValue: 0, duration: 170, useNativeDriver: true })
      .start(() => setNotifOpen(false));
  };

  const navigate = (route: string) => {
    closeDrawer(); closeNotif();
    setTimeout(() => router.push(route as any), 50);
  };

  const isActive    = (route: string) => pathname.includes(route.replace('/(tabs)', ''));
  const displayName = user ? user.first_name : '...';
  const avatarUrl   = user?.profile_pic ? `${BASE_URL.replace('/api.php', '')}/${user.profile_pic}` : null;

  const handleLogout = async () => {
    closeDrawer();
    await logout();
    router.replace('/');
  };

  return (
    <View style={S.root} {...panResponder.panHandlers}>
      <View style={S.statusBarSpacer} />

      {/* ── Top Header ── */}
      <View style={S.header}>
        <View style={S.logoRow}>
          <View style={S.logoIconWrap}>
            <Text style={S.logoEmoji}>🎓</Text>
          </View>
          <Text style={S.logoText}>Trackademic</Text>
        </View>

        <View style={S.headerRight}>
          <TouchableOpacity style={S.notifBtn} onPress={() => notifOpen ? closeNotif() : openNotif()}>
            <Ionicons name="notifications-outline" size={24} color="#555" />
            {unreadCount > 0 && (
              <View style={S.badge}><Text style={S.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={S.headerAvatar} onPress={openDrawer}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={S.headerAvatarImg} />
              : <Ionicons name="person" size={18} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={openDrawer} style={S.menuBtn}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Page Content ── */}
      <View style={S.body} pointerEvents={drawerOpen || notifOpen ? 'none' : 'auto'}>
        {(title || breadcrumb) && (
          <View style={S.pageHeader}>
            {title && <Text style={S.pageTitle}>{title}</Text>}
            {breadcrumb && breadcrumb.length > 0 && (
              <View style={S.breadcrumb}>
                {breadcrumb.map((crumb, i) => (
                  <View key={i} style={S.breadcrumbItem}>
                    {i > 0 && <Text style={S.breadcrumbSep}> / </Text>}
                    <Text style={[S.breadcrumbText, i === breadcrumb.length - 1 && S.breadcrumbActive]}>{crumb}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {children}
      </View>

      {/* ── Notification Panel ── */}
      {notifOpen && <Pressable style={S.dimOverlay} onPress={closeNotif} />}
      {notifOpen && (
        <Animated.View style={[S.notifPanel, {
          opacity: notifAnim,
          transform: [{ translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
        }]}>
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
          <View style={S.notifGlassInner}>
            <View style={S.notifHeader}><Text style={S.notifTitle}>Notifications</Text></View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              {notifs.length === 0 && <View style={S.notifEmpty}><Text style={S.notifEmptyText}>No notifications yet</Text></View>}
              {notifs.map((n) => (
                <View key={n.id} style={[S.notifRow, !n.is_read && S.notifRowUnread]}>
                  <View style={S.notifContent}>
                    <Text style={S.notifSender}>{n.sender_name}</Text>
                    <Text style={S.notifMsg}>{n.message}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* ── Side Drawer ── */}
      {drawerOpen && <Pressable style={S.drawerOverlay} onPress={closeDrawer} />}
      <Animated.View style={[S.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={S.drawerTop}>
          <View style={S.drawerAvatar}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={S.drawerAvatarImg} />
              : <Ionicons name="person" size={26} color="#fff" />}
          </View>
          <View style={S.drawerUserInfo}>
            <Text style={S.drawerUserName} numberOfLines={1}>{displayName}</Text>
            <Text style={S.drawerUserRole}>Student</Text>
          </View>
        </View>

        <View style={S.drawerDivider} />

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity key={item.route} style={[S.drawerItem, active && S.drawerItemActive]} onPress={() => navigate(item.route)}>
              <Ionicons name={item.icon} size={18} color={active ? '#fff' : '#99aabb'} />
              <Text style={[S.drawerItemText, active && S.drawerItemTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={S.drawerFooter}>
          <TouchableOpacity style={S.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#e74c3c" />
            <Text style={S.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f5f7' },
  statusBarSpacer: { height: STATUS_BAR_HEIGHT, backgroundColor: '#fff' },

  header: { height: 56, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e8e8e8', zIndex: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconWrap: { width: 30, height: 30, backgroundColor: '#1a2e4a', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  logoEmoji: { fontSize: 16 },
  logoText: { fontSize: 18, fontWeight: '700', color: '#1a2e4a' },
  headerRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 12 },
  menuBtn: { padding: 4 },
  notifBtn: { position: 'relative', padding: 4 },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#17a2b8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  headerAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#e74c3c', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  body: { flex: 1 },
  pageHeader: { paddingHorizontal: 16, paddingVertical: 14 },
  pageTitle: { fontSize: 20, fontWeight: '600', color: '#222' },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbSep: { color: '#bbb', fontSize: 12 },
  breadcrumbText: { fontSize: 12, color: '#17a2b8' },
  breadcrumbActive: { color: '#888' },

  drawer: { position: 'absolute', top: 0, right: 0, bottom: 0, width: DRAWER_WIDTH, backgroundColor: '#2c3e50', zIndex: 100, paddingTop: STATUS_BAR_HEIGHT, shadowColor: '#000', shadowOffset: { width: -3, height: 0 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10 },
  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 90 },
  drawerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 25, gap: 12 },
  drawerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#17a2b8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  drawerAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  drawerUserInfo: { flex: 1 },
  drawerUserName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  drawerUserRole: { fontSize: 12, color: '#7a8fa6' },
  drawerDivider: { height: 1, backgroundColor: '#3d5166', marginHorizontal: 20, marginBottom: 10 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 12 },
  drawerItemActive: { backgroundColor: '#17a2b8' },
  drawerItemText: { color: '#99aabb', fontSize: 15, fontWeight: '500' },
  drawerItemTextActive: { color: '#fff', fontWeight: '600' },
  drawerFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#3d5166', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  logoutText: { color: '#e74c3c', fontSize: 15, fontWeight: '600' },

  dimOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 40 },
  notifPanel: { position: 'absolute', top: STATUS_BAR_HEIGHT + 60, right: 16, width: 280, borderRadius: 15, overflow: 'hidden', zIndex: 50, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  notifGlassInner: { backgroundColor: 'rgba(255,255,255,0.9)' },
  notifHeader: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  notifTitle: { fontWeight: '700' },
  notifEmpty: { padding: 30, alignItems: 'center' },
  notifEmptyText: { color: '#999', fontSize: 13 },
  notifRow: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  notifRowUnread: { backgroundColor: '#f0f9fa' },
  notifContent: { gap: 2 },
  notifSender: { fontSize: 13, fontWeight: '700' },
  notifMsg: { fontSize: 12, color: '#555' },
});
