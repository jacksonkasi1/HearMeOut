import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { useEmergencyLogsStore } from '@/stores/emergencyLogsStore';
import { EmergencyLogItem } from '@/components/shared/EmergencyLogItem';
import { Button } from '@/components/ui/Button';

export default function HistoryScreen() {
  const { logs, fetchLogs, clearLogs, loading } = useEmergencyLogsStore();
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  const handleClearHistory = async () => {
    await clearLogs();
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency History</Text>
          {logs.length > 0 && (
            <Button
              title="Clear All"
              onPress={handleClearHistory}
              variant="outline"
              size="small"
            />
          )}
        </View>
        
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No emergency events recorded yet</Text>
            <Text style={styles.emptySubtext}>
              When emergencies are detected, they will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EmergencyLogItem log={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fonts.sizes.md,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});