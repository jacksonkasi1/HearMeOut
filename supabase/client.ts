import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

// NOTE: This is key is test, no lo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://onhgvwotpbvxkypcgken.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uaGd2d290cGJ2eGt5cGNna2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzQ1NDgsImV4cCI6MjA2MTI1MDU0OH0.NRqJwBXC8nZLEq60VJ8GkEOewRRUlvYIQ0KJfqedau4";

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		flowType: 'pkce',
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
