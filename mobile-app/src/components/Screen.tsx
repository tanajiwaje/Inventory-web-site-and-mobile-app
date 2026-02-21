import { ReactNode, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/useAuth';
import { useUI } from '../ui/UIContext';
import { colors, spacing } from '../theme/tokens';

const roleAccent = (role?: string) => {
  if (role === 'admin' || role === 'super_admin') return '#1d4ed8';
  if (role === 'seller') return '#166534';
  return '#7c3aed';
};

export const Screen = ({ children }: { children: ReactNode }) => {
  const { token, user, logout } = useAuth();
  const { company, unreadCount, openNotifications } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();
  const accent = roleAccent(user?.role);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {token ? (
          <>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                {company?.logoUrl ? (
                  <Image source={{ uri: company.logoUrl }} style={styles.logo} />
                ) : (
                  <View style={[styles.logoFallback, { backgroundColor: accent }]}>
                    <Text style={styles.logoText}>{(company?.name || 'INV').slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.companyName}>{company?.name || 'Inventory App'}</Text>
                  <Text style={styles.companySub}>{user?.role?.toUpperCase() || 'USER'}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.iconButton} onPress={openNotifications} accessibilityRole="button" accessibilityLabel="Open notifications">
                  <Ionicons name="notifications-outline" size={20} color={colors.text} />
                  {unreadCount ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable style={[styles.avatar, { backgroundColor: accent }]} onPress={() => setMenuOpen((prev) => !prev)} accessibilityRole="button" accessibilityLabel="Open profile menu">
                  <Text style={styles.avatarText}>{initials}</Text>
                </Pressable>
              </View>
            </View>
            {menuOpen ? (
              <>
                <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
                <View style={styles.profileMenu}>
                  <Text style={styles.menuName}>{user?.name || 'User'}</Text>
                  <Text style={styles.menuMeta}>{user?.email || '-'}</Text>
                  <Text style={styles.menuMeta}>{user?.role?.toUpperCase() || 'USER'}</Text>
                  <Pressable
                    style={styles.logoutButton}
                    onPress={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Logout"
                  >
                    <Text style={styles.logoutText}>Logout</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  content: { flex: 1 },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, paddingRight: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: 18 },
  logoFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: { color: '#fff', fontWeight: '700' },
  companyName: { color: colors.text, fontWeight: '700' },
  companySub: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: 4
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20
  },
  profileMenu: {
    position: 'absolute',
    top: 58,
    right: spacing.lg,
    width: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    zIndex: 30
  },
  menuName: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  menuMeta: { color: colors.textMuted, marginBottom: 4 },
  logoutButton: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: { color: '#fff', fontWeight: '700' }
});
