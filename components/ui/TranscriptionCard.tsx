import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from './Card';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';

interface TranscriptionCardProps {
  text: string;
  isEmergency: boolean;
  confidence?: number;
}

export const TranscriptionCard: React.FC<TranscriptionCardProps> = ({
  text,
  isEmergency,
  confidence = 0,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Scroll to bottom when text changes
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    
    // Highlight animation for emergency text
    if (isEmergency) {
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
          delay: 500,
        }),
      ]).start();
    }
  }, [text, isEmergency, highlightAnim]);
  
  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isEmergency ? colors.card : colors.card,
      isEmergency ? colors.emergencyBackground : colors.card,
    ],
  });
  
  const textColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isEmergency ? colors.danger : colors.text,
      isEmergency ? colors.textDark : colors.text,
    ],
  });
  
  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Transcription</Text>
        {confidence > 0 && (
          <View style={[
            styles.confidenceIndicator,
            {
              backgroundColor: 
                confidence > 0.7 ? colors.success :
                confidence > 0.4 ? colors.warning :
                colors.danger
            }
          ]}>
            <Text style={styles.confidenceText}>
              {Math.round(confidence * 100)}%
            </Text>
          </View>
        )}
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.Text style={[styles.transcriptionText, { color: textColor }]}>
          {text || "Listening for audio..."}
        </Animated.Text>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
  },
  confidenceIndicator: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.success,
  },
  confidenceText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
  },
  transcriptionText: {
    fontSize: fonts.sizes.md,
    lineHeight: fonts.sizes.md * 1.5,
    color: colors.text,
  },
});