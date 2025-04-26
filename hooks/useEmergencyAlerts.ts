import { useState, useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useProfileStore } from '@/stores/profileStore';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Camera from 'expo-camera';

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
      if (profile.enable_flashlight && Platform.OS !== 'web' && Camera.Camera.isAvailableAsync()) {
        toggleFlashlight(true);
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
        // Create a strobe effect
        if (flashIntervalRef.current) {
          clearInterval(flashIntervalRef.current);
        }
        flashIntervalRef.current = setInterval(async () => {
          setIsFlashlightOn((prev) => {
            const newState = !prev;
            try {
              if (Platform.OS !== 'web') {
                Camera.Camera.setTorchModeAsync(!newState);
              }
            } catch (e) {
              console.error('Failed to toggle flashlight:', e);
            }
            return newState;
          });
        }, 500);
      } else {
        if (flashIntervalRef.current) {
          clearInterval(flashIntervalRef.current);
          flashIntervalRef.current = null;
        }
        if (Platform.OS !== 'web') {
          await Camera.Camera.setTorchModeAsync(false);
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
    // Stop flashlight
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    if (Platform.OS !== 'web') {
      Torch.setTorchModeAsync(false).catch((e) => {
        console.error('Failed to turn off flashlight:', e);
      });
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