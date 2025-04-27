import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import { EmergencyAlert } from '@/components/ui/EmergencyAlert';

export default function ListenScreen() {
  const [isListening, setIsListening] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const { 
    isAlertActive, 
    triggerEmergencyAlerts, 
    stopAllAlerts 
  } = useEmergencyAlerts();
  
  // Reset alerts when component unmounts
  useEffect(() => {
    return () => {
      stopAllAlerts();
    };
  }, [stopAllAlerts]);
  
  const toggleListening = () => {
    setIsListening(!isListening);
    
    // If turning off listening, also clear any active emergency
    if (isListening) {
      handleClearEmergency();
    }
  };
  
  const simulateEmergency = () => {
    // Simulate detection of emergency keyword "fire"
    const keyword = 'fire';
    const simulatedTranscription = 'I think there is a fire in the building! Everyone evacuate now!';
    
    // Activate emergency alerts
    setEmergencyActive(true);
    setCurrentKeyword(keyword);
    setTranscription(simulatedTranscription);
    
    // Trigger system alerts (vibration, flashlight, etc.)
    triggerEmergencyAlerts(true);
    
    console.log('Emergency simulated');
  };
  
  const simulateNormal = () => {
    // Clear emergency state
    handleClearEmergency();
    
    console.log('Normal state simulated');
  };
  
  const handleClearEmergency = () => {
    // Reset emergency state
    setEmergencyActive(false);
    setCurrentKeyword(null);
    setTranscription(null);
    
    // Stop system alerts
    triggerEmergencyAlerts(false);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      
      {/* Emergency alert overlay */}
      <EmergencyAlert 
        visible={emergencyActive} 
        keyword={currentKeyword}
        transcription={transcription || ''}
        onClose={handleClearEmergency}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HearMeOut</Text>
          <Text style={styles.subtitle}>Emergency Audio Detection</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              {
                backgroundColor: emergencyActive 
                  ? colors.danger 
                  : isListening 
                    ? colors.success 
                    : colors.textTertiary
              }
            ]} 
          />
          <Text style={[
            styles.statusText,
            emergencyActive && styles.emergencyStatusText
          ]}>
            {emergencyActive 
              ? 'EMERGENCY DETECTED' 
              : isListening 
                ? 'Listening for emergencies...' 
                : 'Monitoring paused'
            }
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.listenButton,
            emergencyActive && styles.emergencyListenButton
          ]} 
          onPress={toggleListening}
          activeOpacity={0.8}
        >
          <Feather 
            name={isListening ? "mic-off" : "mic"} 
            size={40} 
            color={emergencyActive ? colors.textDark : colors.text} 
          />
          <Text style={[
            styles.listenButtonText,
            emergencyActive && styles.emergencyListenButtonText
          ]}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.demoControls}>
          <Text style={styles.demoTitle}>Demo Controls</Text>
          <View style={styles.demoButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.demoButton,
                emergencyActive && styles.disabledDemoButton
              ]}
              onPress={simulateEmergency}
              disabled={emergencyActive}
            >
              <Text style={styles.demoButtonText}>Simulate Emergency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.demoButton,
                !emergencyActive && styles.disabledDemoButton
              ]}
              onPress={simulateNormal}
              disabled={!emergencyActive}
            >
              <Text style={styles.demoButtonText}>Clear Emergency</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  emergencyStatusText: {
    color: colors.danger,
    fontWeight: fonts.weights.bold,
  },
  listenButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyListenButton: {
    backgroundColor: colors.danger,
  },
  listenButtonText: {
    marginTop: spacing.sm,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.text,
  },
  emergencyListenButtonText: {
    color: colors.textDark,
  },
  demoControls: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  demoTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  demoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  demoButton: {
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.sm,
  },
  disabledDemoButton: {
    opacity: 0.5,
  },
  demoButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  }
});