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
      
      // Always enable vibration in emergency mode
      triggerVibration(true);
      
      if (profile?.enable_flashlight && Platform.OS !== 'web') {
        try {
          const { status } = await Camera.requestCameraPermissionsAsync();
          if (status === 'granted') {
            toggleFlashlight(true);
          }
        } catch (error) {
          console.error('Camera permission error:', error);
        }
      }
    } else {
      stopAllAlerts();
    }
  };
  
  const triggerVibration = (on: boolean) => {
    if (!on) {
      // Stop vibration
      Vibration.cancel();
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      setIsVibrating(false);
      return;
    }

    setIsVibrating(true);
    
    // For iOS, use Haptics for better feedback
    if (Platform.OS === 'ios') {
      // SOS pattern using Haptics (3 short, 3 long, 3 short)
      const iosVibrationPattern = async () => {
        try {
          // Short pulses (3 times)
          for (let i = 0; i < 3; i++) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Slight pause
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Long pulses (3 times)
          for (let i = 0; i < 3; i++) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(resolve => setTimeout(resolve, 200));
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Slight pause
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Short pulses (3 times)
          for (let i = 0; i < 3; i++) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error('Haptics error:', error);
          // Fallback to basic vibration if haptics fail
          Vibration.vibrate([500, 500, 500, 500], true);
        }
      };
      
      // Run the pattern immediately
      iosVibrationPattern();
      
      // Repeat the pattern every 5 seconds
      vibrationIntervalRef.current = setInterval(() => {
        iosVibrationPattern();
      }, 5000);
    } else {
      // For Android, use pattern vibration
      // SOS pattern: ... --- ...
      // Short pulse: 200ms vibrate, 200ms pause
      // Long pulse: 500ms vibrate, 200ms pause
      const androidSOSPattern = [
        0, // Initial delay
        200, 200, 200, 200, 200, 200, // 3 short pulses (... = S)
        500, 200, 500, 200, 500, 200, // 3 long pulses (--- = O)
        200, 200, 200, 200, 200, 200, // 3 short pulses (... = S)
        1000 // Pause before repeating
      ];
      
      // Vibrate with SOS pattern and repeat
      Vibration.vibrate(androidSOSPattern, true);
    }
  };
  
  const toggleFlashlight = async (on: boolean) => {
    if (Platform.OS === 'web') return;
    
    try {
      if (on) {
        // Create a strobe effect - Clear existing interval if any
        if (flashIntervalRef.current) {
          clearInterval(flashIntervalRef.current);
        }
        
        // Start with the flashlight on
        setIsFlashlightOn(true);
        
        // Toggle at a faster rate (300ms) for more attention-grabbing effect
        flashIntervalRef.current = setInterval(() => {
          setIsFlashlightOn(prev => !prev);
        }, 300);
      } else {
        // Turn off strobe effect
        if (flashIntervalRef.current) {
          clearInterval(flashIntervalRef.current);
          flashIntervalRef.current = null;
        }
        setIsFlashlightOn(false);
      }
    } catch (e) {
      console.error('Failed to toggle flashlight:', e);
    }
  };
  
  const stopAllAlerts = () => {
    setIsAlertActive(false);
    
    // Stop vibration
    triggerVibration(false);
    
    // Stop flashlight effect
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
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