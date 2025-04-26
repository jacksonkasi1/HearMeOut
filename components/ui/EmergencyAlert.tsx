import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Card } from './Card';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';

interface EmergencyAlertProps {
  visible: boolean;
  keyword?: string | null;
  transcription?: string;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  visible,
  keyword,
  transcription,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Stop pulsing animation
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [visible, pulseAnim, fadeAnim]);
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Card variant="emergency" style={styles.card}>
        <View style={styles.iconContainer}>
          <Feather name="alert-triangle" size={32} color={colors.textDark} />
        </View>
        <Text style={styles.title}>EMERGENCY DETECTED</Text>
        {keyword && (
          <Text style={styles.keyword}>Keyword: {keyword}</Text>
        )}
        {transcription && (
          <Text style={styles.transcription}>{transcription}</Text>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  card: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  keyword: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  transcription: {
    fontSize: fonts.sizes.md,
    color: colors.textDark,
    textAlign: 'center',
  },
});