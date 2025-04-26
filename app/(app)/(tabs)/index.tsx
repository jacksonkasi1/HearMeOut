import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';

export default function ListenScreen() {
  const [isListening, setIsListening] = useState(false);
  
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  
  const simulateEmergency = () => {
    // Add emergency simulation logic here
    console.log('Emergency simulated');
  };
  
  const simulateNormal = () => {
    // Add normal state simulation logic here
    console.log('Normal state simulated');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HearMeOut</Text>
          <Text style={styles.subtitle}>Emergency Audio Detection</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, {backgroundColor: isListening ? colors.success : colors.textTertiary}]} />
          <Text style={styles.statusText}>
            {isListening ? 'Listening for emergencies...' : 'Monitoring paused'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.listenButton} 
          onPress={toggleListening}
          activeOpacity={0.8}
        >
          <Feather 
            name={isListening ? "mic-off" : "mic"} 
            size={40} 
            color="black" 
          />
          <Text style={styles.listenButtonText}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.demoControls}>
          <Text style={styles.demoTitle}>Demo Controls</Text>
          <View style={styles.demoButtonsContainer}>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={simulateEmergency}
            >
              <Text style={styles.demoButtonText}>Simulate Emergency</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={simulateNormal}
            >
              <Text style={styles.demoButtonText}>Simulate Normal</Text>
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
  listenButtonText: {
    marginTop: spacing.sm,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.text,
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
  demoButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.text,
  }
});