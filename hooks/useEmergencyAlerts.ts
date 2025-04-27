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
  
  // Use separate timeout references for better control
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vibration1TimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vibration2TimeoutRef = useRef<NodeJS.Timeout | null>(null); 
  const flashOnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashOffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashlightIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAlerts();
    };
  }, []);
  
  // Handle flashlight state and ensure it updates correctly
  useEffect(() => {
    console.log(`Flashlight state changed: ${isFlashlightOn ? 'ON' : 'OFF'}`);
  }, [isFlashlightOn]);
  
  // Toggle alerts based on profile settings and emergency state
  const triggerEmergencyAlerts = async (isEmergency: boolean) => {
    if (isEmergency) {
      setIsAlertActive(true);
      
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
      
      // Sequence of alerts: vibrate - flash - vibrate...
      startAlertSequence();
    } else {
      stopAllAlerts();
    }
  };
  
  const startAlertSequence = () => {
    // Clear any existing sequences
    clearAllTimeouts();
    
    // Reset states
    setIsVibrating(false);
    setIsFlashlightOn(false);
    
    // Start the initial sequence
    startSequenceCycle();
    
    // Setup interval to continually run sequence
    sequenceIntervalRef.current = setInterval(() => {
      startSequenceCycle();
    }, 5000); // Full cycle takes 5 seconds for more predictability
    
    // Backup method: Create a separate interval just for the flashlight
    // This ensures the flashlight works even if other parts of the sequence fail
    flashlightIntervalRef.current = setInterval(() => {
      // Turn on flashlight
      setIsFlashlightOn(true);
      
      // Schedule turning it off
      setTimeout(() => {
        setIsFlashlightOn(false);
      }, 1000);
    }, 5000); // Same cycle length as the main sequence
  };
  
  const startSequenceCycle = () => {
    console.log('Starting new alert cycle');
    
    // 1. Start with vibration
    handleVibration(true);
    setIsVibrating(true);
    
    // 2. After 1 second, stop vibration and prepare for flashlight
    vibration1TimeoutRef.current = setTimeout(() => {
      handleVibration(false);
      setIsVibrating(false);
      console.log('First vibration complete, preparing for flash');
      
      // 3. Turn on flashlight after a short delay
      flashOnTimeoutRef.current = setTimeout(() => {
        console.log('Turning flashlight ON');
        setIsFlashlightOn(true);
        
        // 4. Keep flashlight on for 1 second (increased from 0.5s for better visibility)
        flashOffTimeoutRef.current = setTimeout(() => {
          console.log('Turning flashlight OFF');
          setIsFlashlightOn(false);
          
          // 5. Start second vibration after a short delay
          vibration2TimeoutRef.current = setTimeout(() => {
            console.log('Starting second vibration');
            handleVibration(true);
            setIsVibrating(true);
            
            // Turn off second vibration after 1.5 seconds
            setTimeout(() => {
              handleVibration(false);
              setIsVibrating(false);
              console.log('Second vibration complete, cycle finished');
            }, 1500);
          }, 500); // Increased delay before second vibration
        }, 1000); // Increased flashlight duration
      }, 500); // Increased delay before flashlight
    }, 1000);
  };
  
  const handleVibration = (on: boolean) => {
    console.log(`Handling vibration: ${on ? 'ON' : 'OFF'}`);
    
    if (!on) {
      // Stop vibration
      console.log('Canceling vibration');
      Vibration.cancel();
      return;
    }
    
    try {
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
        // For Android, use a repeating pattern for stronger vibration
        // Pattern is in milliseconds: [wait, vibrate, wait, vibrate, ...]
        console.log('Starting Android vibration pattern');
        
        // This creates a more noticeable vibration pattern
        // Wait 0ms -> vibrate 300ms -> wait 100ms -> vibrate 500ms
        const pattern = [0, 300, 100, 500];
        
        // Second parameter means don't repeat (-1 is no repeat, 0 is infinite repeat)
        Vibration.vibrate(pattern, false);
        
        console.log('Android vibration started with pattern:', pattern);
      }
    } catch (error) {
      console.error('Error in vibration handling:', error);
    }
  };

  const clearAllTimeouts = () => {
    // Clear all timeout references
    if (sequenceIntervalRef.current) {
      clearInterval(sequenceIntervalRef.current);
      sequenceIntervalRef.current = null;
    }
    
    if (vibration1TimeoutRef.current) {
      clearTimeout(vibration1TimeoutRef.current);
      vibration1TimeoutRef.current = null;
    }
    
    if (vibration2TimeoutRef.current) {
      clearTimeout(vibration2TimeoutRef.current);
      vibration2TimeoutRef.current = null;
    }
    
    if (flashOnTimeoutRef.current) {
      clearTimeout(flashOnTimeoutRef.current);
      flashOnTimeoutRef.current = null;
    }
    
    if (flashOffTimeoutRef.current) {
      clearTimeout(flashOffTimeoutRef.current);
      flashOffTimeoutRef.current = null;
    }
    
    if (flashlightIntervalRef.current) {
      clearInterval(flashlightIntervalRef.current);
      flashlightIntervalRef.current = null;
    }
  }
  
  const stopAllAlerts = () => {
    console.log('Stopping all alerts');
    setIsAlertActive(false);
    
    // Stop vibration
    Vibration.cancel();
    
    // Clear all timeouts and intervals
    clearAllTimeouts();
    
    // Reset states
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