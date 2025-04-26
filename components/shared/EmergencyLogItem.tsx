import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { EmergencyLog } from '@/types';
import { Feather } from '@expo/vector-icons';

interface EmergencyLogItemProps {
  log: EmergencyLog;
}

export const EmergencyLogItem: React.FC<EmergencyLogItemProps> = ({ log }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Feather name="alert-triangle" size={16} color={colors.danger} />
          <Text style={styles.type}>{log.emergency_type.toUpperCase()}</Text>
        </View>
        <Text style={styles.date}>{formatDate(log.created_at)}</Text>
      </View>
      
      <Text style={styles.transcription}>{log.transcription}</Text>
      
      <View style={styles.footer}>
        <View style={[
          styles.confidenceIndicator,
          {
            backgroundColor: 
              log.confidence > 0.7 ? colors.success :
              log.confidence > 0.4 ? colors.warning :
              colors.danger
          }
        ]}>
          <Text style={styles.confidenceText}>
            {Math.round(log.confidence * 100)}% confidence
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  date: {
    fontSize: fonts.sizes.sm,
    color: colors.textTertiary,
  },
  transcription: {
    fontSize: fonts.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confidenceIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.round,
  },
  confidenceText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.medium,
    color: colors.textDark,
  },
});