import { supabase } from '@/supabase/client';

export interface TranscriptionResult {
  transcription: string;
  isEmergency: boolean;
  confidence: number;
  detectedKeyword: string | null;
}

export async function transcribeAudio(
  audioData: string,
  emergencyKeywords?: string[]
): Promise<TranscriptionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('transcribe_audio', {
      body: { audioData, emergencyKeywords },
    });

    if (error) throw new Error(error.message);
    
    return data as TranscriptionResult;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}