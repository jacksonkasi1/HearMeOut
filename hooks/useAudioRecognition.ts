import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { transcribeAudio } from '@/supabase/functions/transcribe_audio/handlers/client';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { AudioRecognitionResult } from '@/types';
import { Platform } from 'react-native';

export function useAudioRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<Audio.PermissionResponse | null>(null);
  
  const recording = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { profile } = useProfileStore();
  const userId = useAuthStore.getState().getUserId();
  
  // Request permissions
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const permissionResponse = await Audio.requestPermissionsAsync();
          setPermission(permissionResponse);
          
          if (permissionResponse.status !== 'granted') {
            setError('Permission to access microphone is required!');
          }
        }
      } catch (err) {
        setError('Failed to get permission: ' + err.message);
      }
    })();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const startListening = async () => {
    try {
      if (Platform.OS === 'web') {
        setError('Audio recording is not supported on web platform for this demo');
        return;
      }
      
      if (!permission?.granted) {
        setError('Permission to access microphone is required!');
        return;
      }
      
      setError(null);
      
      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setIsListening(true);
      
      // Set up interval to process audio every few seconds
      intervalRef.current = setInterval(async () => {
        await processCurrentAudio();
      }, 3000); // Process every 3 seconds
      
    } catch (err) {
      setError('Failed to start recording: ' + err.message);
    }
  };
  
  const stopListening = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }
      
      setIsListening(false);
    } catch (err) {
      setError('Failed to stop recording: ' + err.message);
    }
  };
  
  const processCurrentAudio = async () => {
    if (!recording.current) return;
    
    try {
      // Stop current recording to process it
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      // Read the audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Start a new recording while processing the previous one
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      
      // Send to our edge function for processing
      const result = await transcribeAudio(
        base64Audio,
        profile?.emergency_keywords
      );
      
      updateRecognitionState(result);
      
    } catch (err) {
      setError('Failed to process audio: ' + err.message);
    }
  };
  
  const updateRecognitionState = (result: AudioRecognitionResult) => {
    setTranscription(result.transcription);
    setIsEmergency(result.isEmergency);
    setConfidence(result.confidence);
    setDetectedKeyword(result.detectedKeyword);
  };
  
  // For demo purposes, simulate audio recognition
  const simulateEmergencyDetection = async () => {
    try {
      const emergencyPhrases = [
        "Warning! Fire detected in the building. Please evacuate immediately.",
        "Emergency! Please proceed to the nearest exit.",
        "Attention all personnel. This is an emergency evacuation.",
        "Danger! Gas leak detected. Evacuate the premises immediately.",
        "Alert! Security breach on level 2. All personnel must evacuate."
      ];
      
      const randomPhrase = emergencyPhrases[Math.floor(Math.random() * emergencyPhrases.length)];
      
      const mockResult: AudioRecognitionResult = {
        transcription: randomPhrase,
        isEmergency: true,
        confidence: 0.85 + (Math.random() * 0.15),
        detectedKeyword: profile?.emergency_keywords?.[Math.floor(Math.random() * profile.emergency_keywords.length)] || "emergency"
      };
      
      updateRecognitionState(mockResult);
      
    } catch (err) {
      setError('Failed to simulate emergency: ' + err.message);
    }
  };
  
  const simulateNormalDetection = async () => {
    try {
      const normalPhrases = [
        "The weather today is expected to be sunny with a high of 75 degrees.",
        "Welcome to our daily briefing. Today we'll discuss the quarterly results.",
        "Please remember to submit your reports by the end of the day.",
        "The cafeteria will be serving pizza and salad for lunch today.",
        "The next bus will arrive in approximately 5 minutes."
      ];
      
      const randomPhrase = normalPhrases[Math.floor(Math.random() * normalPhrases.length)];
      
      const mockResult: AudioRecognitionResult = {
        transcription: randomPhrase,
        isEmergency: false,
        confidence: 0.5 + (Math.random() * 0.3),
        detectedKeyword: null
      };
      
      updateRecognitionState(mockResult);
      
    } catch (err) {
      setError('Failed to simulate normal detection: ' + err.message);
    }
  };
  
  return {
    isListening,
    transcription,
    isEmergency,
    detectedKeyword,
    confidence,
    error,
    startListening,
    stopListening,
    simulateEmergencyDetection,
    simulateNormalDetection
  };
}