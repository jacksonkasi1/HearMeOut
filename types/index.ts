export interface Profile {
    id: string;
    created_at: string;
    updated_at: string;
    emergency_keywords: string[];
    sensitivity_level: number;
    enable_flashlight: boolean;
    enable_vibration: boolean;
    enable_transcription: boolean;
    last_detection: string | null;
  }
  
  export interface EmergencyLog {
    id: string;
    user_id: string;
    created_at: string;
    emergency_type: string;
    transcription: string;
    confidence: number;
  }
  
  export interface AudioRecognitionResult {
    transcription: string;
    isEmergency: boolean;
    confidence: number;
    detectedKeyword: string | null;
  }