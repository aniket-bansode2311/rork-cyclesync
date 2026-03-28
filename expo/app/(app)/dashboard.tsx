import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Settings, Grid, Plus } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { WidgetRenderer } from '@/components/WidgetRenderer';
import { DashboardCustomization } from '@/components/DashboardCustomization';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { getEnabledWidgets, isLoading } = useDashboard();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCustomization, setShowCustomization] = useState<boolean>(false);

  const enabledWidgets = getEnabledWidgets();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCustomizePress = () => {
    setShowCustomization(true);
  };

  const handleAddWidget = () => {
    setShowCustomization(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Dashboard',
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerRight: () => (
            <TouchableOpacity onPress={handleCustomizePress} style={styles.headerButton}>
              <Settings size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!
              </Text>
              <Text style={styles.subtitleText}>
                Here&apos;s your personalized dashboard
              </Text>
            </View>

            {enabledWidgets.length === 0 ? (
              <View style={styles.emptyState}>
                <Grid size={48} color={colors.gray[400]} />
                <Text style={styles.emptyTitle}>No widgets enabled</Text>
                <Text style={styles.emptyDescription}>
                  Customize your dashboard by adding widgets that matter to you
                </Text>
                <Button
                  title="Add Widgets"
                  onPress={handleAddWidget}
                  leftIcon={<Plus size={18} color={colors.white} />}
                  style={styles.addButton}
                />
              </View>
            ) : (
              <View style={styles.widgetsContainer}>
                {enabledWidgets.map((widget) => (
                  <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    onSettings={() => setShowCustomization(true)}
                  />
                ))}
                
                <TouchableOpacity
                  style={styles.addWidgetCard}
                  onPress={handleAddWidget}
                  activeOpacity={0.7}
                >
                  <Plus size={24} color={colors.primary} />
                  <Text style={styles.addWidgetText}>Add Widget</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <DashboardCustomization
        visible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    paddingHorizontal: 32,
  },
  widgetsContainer: {
    flex: 1,
  },
  addWidgetCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    marginBottom: 16,
    minHeight: 120,
  },
  addWidgetText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
});