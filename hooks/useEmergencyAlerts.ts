import { useState, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useProfileStore } from '@/stores/profileStore';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';

export function useEmergencyAlerts() {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const { profile } = useProfileStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAlerts();
    };
  }, []);
  // Toggle alerts based on profile settings and emergency state
  const triggerEmergencyAlerts = async (isEmergency: boolean) => {
    if (isEmergency && profile) {
      setIsAlertActive(true);
      if (profile.enable_vibration) {
        triggerVibration();
      }
      if (profile.enable_flashlight && Platform.OS !== 'web') {
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
  const triggerVibration = () => {
    // For iOS, use Haptics for better feedback
    if (Platform.OS === 'ios') {
      const interval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // For Android, use pattern vibration
      // Vibrate for 500ms, pause for 500ms, repeat
      Vibration.vibrate([500, 500], true);
    }
  };
  const toggleFlashlight = async (on: boolean) => {
    if (Platform.OS === 'web') return;
    try {
      if (on) {
        // Create a strobe effect (simulated)
        if (flashIntervalRef.current) {
          clearInterval(flashIntervalRef.current);
        }
        flashIntervalRef.current = setInterval(() => {
          setIsFlashlightOn(prev => !prev);
        }, 500);
      } else {
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
    Vibration.cancel();
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
    triggerEmergencyAlerts,
    stopAllAlerts,
  };
}