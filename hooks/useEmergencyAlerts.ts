import { useState, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useProfileStore } from '@/stores/profileStore';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';

export function useEmergencyAlerts() {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const { profile } = useProfileStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAlerts();
    };
  }, []);
  
  // Toggle alerts based on profile settings and emergency state
  const triggerEmergencyAlerts = async (isEmergency: boolean) => {
    if (isEmergency) {
      setIsAlertActive(true);
      
      // Sequence of alerts: vibrate - flash - vibrate...
      startAlertSequence();
      
      // Check for camera permission for flashlight
      if (Platform.OS !== 'web') {
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            console.log('Camera permission not granted, flashlight will not work');
          }
        } catch (error) {
          console.error('Camera permission error:', error);
        }
      }
    } else {
      stopAllAlerts();
    }
  };
  
  const startAlertSequence = () => {
    // Clear any existing sequences
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
    }
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
    }
    
    // Reset states
    setIsVibrating(false);
    setIsFlashlightOn(false);
    
    // Start the sequence
    runSequence();
    
    // Setup interval to continually run sequence
    vibrationIntervalRef.current = setInterval(() => {
      runSequence();
    }, 4000); // Full cycle takes about 4 seconds
  };
  
  const runSequence = () => {
    // 1. Vibrate for 1 second
    handleVibration(true);
    setIsVibrating(true);
    
    // 2. Wait 0.2s, then turn off vibration
    sequenceTimeoutRef.current = setTimeout(() => {
      handleVibration(false);
      setIsVibrating(false);
      
      // 3. Flash for 0.5 second
      sequenceTimeoutRef.current = setTimeout(() => {
        setIsFlashlightOn(true);
        
        // 4. Turn off flash, wait 0.2s
        sequenceTimeoutRef.current = setTimeout(() => {
          setIsFlashlightOn(false);
          
          // 5. Vibrate again for 1.5 seconds
          sequenceTimeoutRef.current = setTimeout(() => {
            handleVibration(true);
            setIsVibrating(true);
            
            // Turn off vibration
            sequenceTimeoutRef.current = setTimeout(() => {
              handleVibration(false);
              setIsVibrating(false);
            }, 1500);
          }, 200);
        }, 500);
      }, 200);
    }, 1000);
  };
  
  const handleVibration = (on: boolean) => {
    if (!on) {
      // Stop vibration
      Vibration.cancel();
      return;
    }
    
    // For iOS, use Haptics for better feedback
    if (Platform.OS === 'ios') {
      const iosVibrationPattern = async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          // iOS can't sustain long vibrations with Haptics API, so we'll pulse it
          await new Promise(resolve => setTimeout(resolve, 200));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await new Promise(resolve => setTimeout(resolve, 200));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
          console.error('Haptics error:', error);
        }
      };
      
      iosVibrationPattern();
    } else {
      // For Android, simple vibration
      // Most Android devices allow a continuous vibration
      Vibration.vibrate(1000);
    }
  };
  
  const stopAllAlerts = () => {
    setIsAlertActive(false);
    
    // Stop vibration
    Vibration.cancel();
    
    // Clear intervals and timeouts
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    
    setIsVibrating(false);
    setIsFlashlightOn(false);
    
    // Stop sound if any
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch((e) => {
        console.error('Failed to unload sound:', e);
      });
      soundRef.current = null;
    }
  };
  
  return {
    isAlertActive,
    isFlashlightOn,
    isVibrating,
    triggerEmergencyAlerts,
    stopAllAlerts,
  };
}