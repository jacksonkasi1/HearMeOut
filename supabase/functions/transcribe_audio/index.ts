// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_npm

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header and user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: userError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = userData.user.id;

    // Parse the request body
    const { audioData, emergencyKeywords } = await req.json();

    if (!audioData) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Audio data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // This is a mock implementation for the hackathon
    // In a real implementation, you would send the audio to a speech-to-text API
    // For the hackathon, we'll simulate the transcription with emergency detection
    
    // Mock transcription result
    const mockTranscriptions = [
      "Please proceed to the nearest exit.",
      "This is a fire alarm. Please evacuate the building immediately.",
      "Warning: Emergency situation detected. Please follow safety protocols.",
      "Attention all personnel, this is not a drill. Evacuate now.",
      "The fire alarm has been activated. Please exit the building.",
    ];
    
    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    const transcription = mockTranscriptions[randomIndex];
    
    // Check if any emergency keywords are in the transcription
    const defaultKeywords = ["fire", "emergency", "evacuate", "danger", "warning", "alert"];
    const keywords = emergencyKeywords || defaultKeywords;
    
    let isEmergency = false;
    let detectedKeyword = "";
    
    for (const keyword of keywords) {
      if (transcription.toLowerCase().includes(keyword.toLowerCase())) {
        isEmergency = true;
        detectedKeyword = keyword;
        break;
      }
    }
    
    // Calculate a mock confidence score
    const confidence = isEmergency ? 0.75 + (Math.random() * 0.2) : 0.3 + (Math.random() * 0.4);
    
    // If it's an emergency with high confidence, log it
    if (isEmergency && confidence > 0.7) {
      await supabaseClient
        .from("emergency_logs")
        .insert({
          user_id: userId,
          emergency_type: detectedKeyword,
          transcription: transcription,
          confidence: confidence
        });
    }
    
    return new Response(
      JSON.stringify({
        transcription,
        isEmergency,
        confidence,
        detectedKeyword: isEmergency ? detectedKeyword : null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});