import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUI } from '../ui/UIContext';
import { colors, radius, spacing } from '../theme/tokens';

export const NotificationCenter = () => {
  const { notificationsOpen, closeNotifications, notifications, markAllRead } = useUI();

  return (
    <Modal visible={notificationsOpen} transparent animationType="fade" onRequestClose={closeNotifications}>
      <Pressable style={styles.backdrop} onPress={closeNotifications}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Ionicons name="notifications-outline" size={18} color={colors.text} />
              <Text style={styles.title}>Notifications</Text>
            </View>
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.markRead}>Mark all read</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {notifications.map((item) => (
              <View key={item.id} style={[styles.item, !item.read && styles.itemUnread]}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
                <Text style={styles.itemTime}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end'
  },
  sheet: {
    maxHeight: '74%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  markRead: { color: colors.primary, fontWeight: '700', paddingVertical: spacing.xs },
  list: { paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  itemUnread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff'
  },
  itemTitle: { color: colors.text, fontWeight: '700' },
  itemDetail: { color: colors.textMuted, marginTop: spacing.xs },
  itemTime: { color: colors.textSubtle, marginTop: spacing.xs, fontSize: 12 }
});
