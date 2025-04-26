import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { useAudioRecognition } from '@/hooks/useAudioRecognition';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import { TranscriptionCard } from '@/components/ui/TranscriptionCard';
import { EmergencyAlert } from '@/components/ui/EmergencyAlert';
import { ControlButton } from '@/components/ui/ControlButton';
import { useProfileStore } from '@/stores/profileStore';
import { useEmergencyLogsStore } from '@/stores/emergencyLogsStore';

export default function Index() {
  const {
    isListening,
    transcription,
    isEmergency,
    detectedKeyword,
    confidence,
    error,
    startListening,
    stopListening,
    simulateEmergencyDetection,
    simulateNormalDetection,
  } = useAudioRecognition();
  
  const {
    isAlertActive,
    isFlashlightOn,
    triggerEmergencyAlerts,
    stopAllAlerts,
  } = useEmergencyAlerts();
  
  const { profile } = useProfileStore();
  const { addLog } = useEmergencyLogsStore();
  
  // Handle emergency detection
  useEffect(() => {
    if (isEmergency && detectedKeyword) {
      triggerEmergencyAlerts(true);
      
      // Log the emergency
      addLog({
        emergency_type: detectedKeyword,
        transcription: transcription,
        confidence: confidence,
      });
    } else {
      triggerEmergencyAlerts(false);
    }
  }, [isEmergency, detectedKeyword, transcription]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopAllAlerts();
    };
  }, []);
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // For demo purposes on web
  const handleSimulateEmergency = () => {
    simulateEmergencyDetection();
  };
  
  const handleSimulateNormal = () => {
    simulateNormalDetection();
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Emergency Alert Overlay */}
      <EmergencyAlert
        visible={isEmergency}
        keyword={detectedKeyword}
        transcription={transcription}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HearMeOut</Text>
          <Text style={styles.subtitle}>Emergency Audio Detection</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isListening ? colors.success : colors.textTertiary }
          ]} />
          <Text style={styles.statusText}>
            {isListening ? 'Listening for emergencies...' : 'Monitoring paused'}
          </Text>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={24} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        {/* Transcription Area */}
        {profile?.enable_transcription && (
          <View style={styles.transcriptionContainer}>
            <TranscriptionCard
              text={transcription}
              isEmergency={isEmergency}
              confidence={confidence}
            />
          </View>
        )}
        
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <ControlButton
            title={isListening ? 'Stop Listening' : 'Start Listening'}
            onPress={toggleListening}
            active={isListening}
            icon={
              <Feather
                name={isListening ? 'mic-off' : 'mic'}
                size={32}
                color={isListening ? colors.textDark : colors.text}
              />
            }
            style={styles.mainControlButton}
          />
          
          {Platform.OS === 'web' && (
            <View style={styles.simulationContainer}>
              <Text style={styles.simulationTitle}>Demo Controls</Text>
              <View style={styles.simulationButtons}>
                <TouchableOpacity
                  style={styles.simulationButton}
                  onPress={handleSimulateEmergency}
                >
                  <Text style={styles.simulationButtonText}>Simulate Emergency</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.simulationButton}
                  onPress={handleSimulateNormal}
                >
                  <Text style={styles.simulationButtonText}>Simulate Normal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '20', // 20% opacity
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fonts.sizes.md,
    color: colors.danger,
    marginLeft: spacing.sm,
    flex: 1,
  },
  transcriptionContainer: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mainControlButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  simulationContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  simulationTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  simulationButtons: {
    flexDirection: 'row',
  },
  simulationButton: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  simulationButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  },
});