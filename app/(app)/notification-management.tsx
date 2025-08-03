import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Bell, Settings, Trash2, Calendar, Clock } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/periodCalculations';

export default function NotificationManagementScreen() {
  const { 
    scheduledNotifications, 
    cancelNotification, 
    cancelAllNotifications,
    isLoading 
  } = useNotifications();

  const handleCancelNotification = (notificationId: string, title: string) => {
    Alert.alert(
      'Cancel Notification',
      `Are you sure you want to cancel "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => cancelNotification(notificationId)
        }
      ]
    );
  };

  const handleCancelAllNotifications = () => {
    Alert.alert(
      'Cancel All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: cancelAllNotifications
        }
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'period':
        return <Bell size={20} color="#EC4899" />;
      case 'ovulation':
        return <Bell size={20} color="#8B5CF6" />;
      case 'fertile_window':
        return <Bell size={20} color="#10B981" />;
      case 'birth_control':
        return <Bell size={20} color="#F59E0B" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'period':
        return 'Period Reminder';
      case 'ovulation':
        return 'Ovulation Reminder';
      case 'fertile_window':
        return 'Fertile Window';
      case 'birth_control':
        return 'Birth Control Reminder';
      default:
        return 'Reminder';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Manage Notifications',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/notification-settings')}
              style={styles.headerButton}
            >
              <Settings size={24} color="#EC4899" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scheduled Notifications</Text>
          <Text style={styles.subtitle}>
            {scheduledNotifications.length} active notifications
          </Text>
        </View>

        {scheduledNotifications.length > 0 && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={handleCancelAllNotifications}
          >
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.clearAllText}>Cancel All Notifications</Text>
          </TouchableOpacity>
        )}

        {scheduledNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Scheduled Notifications</Text>
            <Text style={styles.emptyDescription}>
              Your notifications will appear here once you enable them in settings.
            </Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/notification-settings')}
            >
              <Text style={styles.settingsButtonText}>Go to Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {scheduledNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.body}
                    </Text>
                    <View style={styles.notificationMeta}>
                      <Calendar size={14} color="#6B7280" />
                      <Text style={styles.notificationDate}>
                        {formatDate(new Date(notification.scheduledDate))}
                      </Text>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.notificationTime}>
                        {new Date(notification.scheduledDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleCancelNotification(notification.id, notification.title)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={styles.notificationFooter}>
                  <Text style={styles.notificationTypeLabel}>
                    {getNotificationTypeLabel(notification.type)}
                  </Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: notification.isActive ? '#10B981' : '#6B7280'
                  }]}>
                    <Text style={styles.statusText}>
                      {notification.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerButton: {
    padding: 8,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  settingsButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notificationTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});