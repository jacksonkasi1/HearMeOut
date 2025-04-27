import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { CameraView } from 'expo-camera';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import { Feather } from '@expo/vector-icons';

interface EmergencyAlertProps {
  visible: boolean;
  keyword: string | null;
  transcription: string;
  onClose?: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  visible, 
  keyword,
  transcription,
  onClose
}) => {
  const { isFlashlightOn } = useEmergencyAlerts();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Start animations when alert becomes visible
      slideIn();
      startPulse();
      fadeIn();
    } else {
      // Reset animations when alert is hidden
      slideAnim.setValue(-300);
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    }
  }, [visible]);
  
  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5))
    }).start();
  };
  
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };
  
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ])
    ).start();
  };
  
  return (
    <>
      {/* Hidden camera for flashlight functionality */}
      {visible && (
        <View style={styles.hiddenCamera}>
          <CameraView 
            style={{ width: 1, height: 1 }}
            enableTorch={isFlashlightOn}
          />
        </View>
      )}
      
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.alertContainer,
              { 
                transform: [
                  { translateY: slideAnim },
                  { scale: pulseAnim }
                ] 
              }
            ]}
          >
            <View style={styles.alertHeader}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }]
                }}
              >
                <Feather name="alert-triangle" size={28} color={colors.textDark} />
              </Animated.View>
              <Text style={styles.alertTitle}>EMERGENCY DETECTED</Text>
              
              {onClose && (
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color={colors.textDark} />
                </TouchableOpacity>
              )}
            </View>
            
            {keyword && (
              <View style={styles.keywordContainer}>
                <View style={styles.sectionHeader}>
                  <Feather name="message-circle" size={18} color={colors.textDark} style={styles.sectionIcon} />
                  <Text style={styles.keywordLabel}>Detected Keyword:</Text>
                </View>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            )}
            
            <View style={styles.transcriptionContainer}>
              <View style={styles.sectionHeader}>
                <Feather name="file-text" size={18} color={colors.textDark} style={styles.sectionIcon} />
                <Text style={styles.transcriptionLabel}>Transcription:</Text>
              </View>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Feather name="x-circle" size={18} color={colors.textDark} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Dismiss Alert</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  alertContainer: {
    width: '100%',
    backgroundColor: colors.danger,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  alertHeader: {
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textDark,
    marginLeft: spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionIcon: {
    marginRight: spacing.xs,
  },
  keywordContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  keywordLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textDark,
    opacity: 0.8,
  },
  keywordText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.textDark,
    marginTop: spacing.xs,
  },
  transcriptionContainer: {
    padding: spacing.md,
  },
  transcriptionLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textDark,
    opacity: 0.8,
  },
  transcriptionText: {
    fontSize: fonts.sizes.md,
    color: colors.textDark,
    lineHeight: fonts.sizes.md * 1.4,
    marginTop: spacing.xs,
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  actionButton: {
    margin: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    marginRight: spacing.xs,
  },
  actionButtonText: {
    color: colors.textDark,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.md,
  }
});