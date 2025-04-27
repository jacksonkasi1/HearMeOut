import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { CameraView, Camera } from 'expo-camera';
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
  const emergencyAlerts = useEmergencyAlerts();
  const { isFlashlightOn, isVibrating, triggerEmergencyAlerts, stopAllAlerts } = emergencyAlerts;
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const vibrateAnim = useRef(new Animated.Value(0)).current;
  
  // Restart emergency alerts when visible changes
  useEffect(() => {
    if (visible) {
      console.log("EmergencyAlert is now visible, triggering alerts");
      triggerEmergencyAlerts(true);
    } else {
      console.log("EmergencyAlert is now hidden, stopping alerts");
      stopAllAlerts();
    }
    
    // Cleanup when component unmounts or visibility changes
    return () => {
      console.log("EmergencyAlert cleanup called");
      stopAllAlerts();
    };
  }, [visible]);
  
  // Check camera permission on mount and when alert becomes visible
  useEffect(() => {
    if (visible) {
      checkPermission();
    }
  }, [visible]);
  
  // Start vibration animation when vibrating
  useEffect(() => {
    if (isVibrating) {
      startVibrateAnimation();
    } else {
      vibrateAnim.setValue(0);
    }
  }, [isVibrating]);
  
  // Monitor vibration state with better logging
  useEffect(() => {
    console.log(`Vibration state changed: ${isVibrating ? "ACTIVE" : "INACTIVE"}`);
  }, [isVibrating]);
  
  const checkPermission = async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasCameraPermission(false);
    }
  };
  
  const requestPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasCameraPermission(false);
    }
  };
  
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
  
  const startVibrateAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vibrateAnim, {
          toValue: 3,
          duration: 40,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.timing(vibrateAnim, {
          toValue: -3,
          duration: 40,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.timing(vibrateAnim, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
          easing: Easing.linear
        })
      ])
    ).start();
  };
  
  const handleClose = () => {
    // Ensure we stop all alerts before closing
    stopAllAlerts();
    
    // Then call the parent's onClose callback if provided
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <>
      {/* Hidden camera for flashlight functionality */}
      {visible && hasCameraPermission && (
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
        animationType="none" // Changed to none since we handle animation ourselves
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
                  { scale: pulseAnim },
                  { translateX: vibrateAnim }
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
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color={colors.textDark} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.alertStatusBar}>
              <Text style={styles.alertSequenceText}>Alert Sequence: Vibrate (1s) → Flash (1s) → Vibrate (1.5s)</Text>
            </View>
            
            <View style={styles.alertStatusContainer}>
              {/* Vibration status */}
              <View style={styles.statusItem}>
                <View style={styles.statusIndicator}>
                  <Animated.View
                    style={{
                      transform: [{ translateX: vibrateAnim }]
                    }}
                  >
                    <Feather name="activity" size={20} color={colors.textDark} />
                  </Animated.View>
                  <View style={[styles.vibrateIndicator, isVibrating && styles.vibrateActive]} />
                  <Text style={styles.statusText}>
                    <Text style={styles.statusLabelText}>Vibration</Text>
                    {isVibrating ? ' Active' : ' Idle'}
                  </Text>
                </View>
              </View>
              
              {/* Flashlight status */}
              <View style={styles.statusItem}>
                {hasCameraPermission === false && (
                  <TouchableOpacity 
                    style={styles.permissionButton}
                    onPress={requestPermission}
                    activeOpacity={0.7}
                  >
                    <Feather name="zap" size={16} color={colors.textDark} style={{ marginRight: spacing.xs }} />
                    <Text style={styles.flashlightStatusText}>
                      Enable Flashlight
                    </Text>
                  </TouchableOpacity>
                )}
                
                {hasCameraPermission === true && (
                  <View style={styles.statusIndicator}>
                    <Feather name="zap" size={20} color={colors.textDark} />
                    <View style={[styles.flashlightIndicator, isFlashlightOn && styles.flashlightActive]} />
                    <Text style={styles.statusText}>
                      <Text style={styles.statusLabelText}>Flashlight</Text>
                      {isFlashlightOn ? ' Active' : ' Idle'}
                    </Text>
                  </View>
                )}
              </View>
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
              onPress={handleClose}
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
  alertStatusBar: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: spacing.xs,
    alignItems: 'center',
  },
  alertSequenceText: {
    fontSize: fonts.sizes.sm,
    color: colors.textDark,
    fontWeight: fonts.weights.medium,
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
  alertStatusContainer: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  flashlightIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: spacing.xs,
  },
  flashlightActive: {
    backgroundColor: '#fff',
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  vibrateIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: spacing.xs,
  },
  vibrateActive: {
    backgroundColor: '#fff',
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    color: colors.textDark,
    fontWeight: fonts.weights.medium,
  },
  statusLabelText: {
    opacity: 0.8,
  },
  flashlightStatusText: {
    fontSize: fonts.sizes.sm,
    color: colors.textDark,
    fontWeight: fonts.weights.medium,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
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
    zIndex: 999,
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