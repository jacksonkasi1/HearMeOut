import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView as RNSafeAreaView,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Slider from '@react-native-community/slider';

// Create a simplified fallback component for safety
const SimpleSafeArea: React.FC<{
  children: React.ReactNode;
  style: ViewStyle;
}> = ({ children, style }) => {
  if (Platform.OS === 'ios') {
    return (
      <RNSafeAreaView style={style}>
        {children}
      </RNSafeAreaView>
    );
  }
  return (
    <View style={[style, { paddingTop: 30 }]}>
      {children}
    </View>
  );
};

// Simple loading component
const LoadingView: React.FC = () => (
  <SimpleSafeArea style={styles.safeArea}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading settings...</Text>
    </View>
  </SimpleSafeArea>
);

// Error component
const ErrorView: React.FC<{
  error: string | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <SimpleSafeArea style={styles.safeArea}>
    <View style={styles.loadingContainer}>
      <Text style={styles.errorText}>Could not load settings</Text>
      {error && (
        <Text style={styles.errorDetailText}>Error: {error}</Text>
      )}
      <Button 
        title="Try Again" 
        onPress={onRetry}
        style={styles.retryButton}
      />
    </View>
  </SimpleSafeArea>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    profile, 
    fetchProfile,
    loading: profileLoading,
    error: profileError,
    toggleFlashlight,
    toggleVibration,
    toggleTranscription,
    updateSensitivityLevel,
  } = useProfileStore();
  
  const { user, getUserId, signOut } = useAuthStore();
  
  // Debug function to show current state
  const showDebugInfo = useCallback(() => {
    try {
      const info = {
        userId: getUserId?.() || 'No user ID',
        hasProfile: !!profile,
        profileData: profile || 'No profile data',
        authUser: user?.id || 'No auth user',
        profileError: profileError || 'No error',
        profileLoading: profileLoading || false,
      };
      
      console.log('Debug Info:', JSON.stringify(info, null, 2));
      
      Alert.alert(
        'Debug Info',
        `User ID: ${getUserId?.() || 'None'}\nProfile Loaded: ${!!profile}\nError: ${profileError || 'None'}`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Error in debug info:', err);
    }
  }, [profile, user, profileError, profileLoading, getUserId]);
  
  // Load profile only once on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading profile, user ID:', getUserId?.() || 'Unknown');
        await fetchProfile();
        
        if (isMounted) {
          console.log('Profile state after fetch:', profile ? 'Loaded' : 'Not loaded');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error in loadProfile effect:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to load profile');
          setIsLoading(false);
        }
      }
    };
    
    loadProfile();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut?.();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, [signOut]);
  
  const handleToggleFlashlight = useCallback(async (value: boolean) => {
    try {
      await toggleFlashlight?.(value);
    } catch (err) {
      console.error('Error toggling flashlight:', err);
    }
  }, [toggleFlashlight]);
  
  const handleToggleVibration = useCallback(async (value: boolean) => {
    try {
      await toggleVibration?.(value);
    } catch (err) {
      console.error('Error toggling vibration:', err);
    }
  }, [toggleVibration]);
  
  const handleToggleTranscription = useCallback(async (value: boolean) => {
    try {
      await toggleTranscription?.(value);
    } catch (err) {
      console.error('Error toggling transcription:', err);
    }
  }, [toggleTranscription]);
  
  const handleSensitivityChange = useCallback(async (value: number) => {
    try {
      await updateSensitivityLevel?.(Math.round(value));
    } catch (err) {
      console.error('Error updating sensitivity:', err);
    }
  }, [updateSensitivityLevel]);
  
  const handleFetchProfileAgain = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Re-fetching profile, user ID:', getUserId?.() || 'Unknown');
      await fetchProfile();
      console.log('Profile after re-fetch:', !!profile);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error in fetchProfile retry:', err);
      setError(err?.message || 'Failed to reload profile');
      setIsLoading(false);
    }
  }, [fetchProfile, getUserId, profile]);
  
  // Safely get sensitivity level with fallback
  const sensitivityLevel = useMemo(() => {
    try {
      return profile?.sensitivity_level ?? 3;
    } catch (err) {
      console.error('Error accessing sensitivity level:', err);
      return 3;
    }
  }, [profile]);
  
  // Safe render for loading state
  if (isLoading || profileLoading) {
    return <LoadingView />;
  }
  
  // Safe render for error state
  if (error || profileError || !profile) {
    return <ErrorView error={error || profileError} onRetry={handleFetchProfileAgain} />;
  }
  
  // Only render the full UI when we have data
  try {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={showDebugInfo} style={styles.debugButton}>
              <Text style={styles.debugButtonText}>Debug</Text>
            </TouchableOpacity>
          </View>
          
          {/* Alert Settings */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Alert Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Flashlight Alerts</Text>
                <Text style={styles.settingDescription}>
                  Flash device light during emergencies
                </Text>
              </View>
              <Switch
                value={profile?.enable_flashlight ?? false}
                onValueChange={handleToggleFlashlight}
                trackColor={{ false: colors.textTertiary, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Vibration Alerts</Text>
                <Text style={styles.settingDescription}>
                  Vibrate device during emergencies
                </Text>
              </View>
              <Switch
                value={profile?.enable_vibration ?? false}
                onValueChange={handleToggleVibration}
                trackColor={{ false: colors.textTertiary, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Live Transcription</Text>
                <Text style={styles.settingDescription}>
                  Show real-time text of what's being said
                </Text>
              </View>
              <Switch
                value={profile?.enable_transcription ?? false}
                onValueChange={handleToggleTranscription}
                trackColor={{ false: colors.textTertiary, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </Card>
          
          {/* Detection Settings */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Settings</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/keywords')}
            >
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Emergency Keywords</Text>
                <Text style={styles.settingDescription}>
                  Customize words that trigger alerts
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Detection Sensitivity</Text>
                <Text style={styles.settingDescription}>
                  Adjust how sensitive the detection is
                </Text>
              </View>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Low</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sensitivityLevel}
                onValueChange={handleSensitivityChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.textTertiary}
                thumbTintColor={colors.primary}
              />
              <Text style={styles.sliderLabel}>High</Text>
            </View>
          </Card>
          
          {/* History */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/history')}
            >
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Emergency History</Text>
                <Text style={styles.settingDescription}>
                  View past detected emergencies
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </Card>
          
          {/* Account - Always show this section */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              style={styles.signOutButton}
            />
          </Card>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>HearMeOut v1.0.0</Text>
            <Text style={styles.footerText}>Hackathon Project</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (err: any) {
    console.error('Error rendering settings screen:', err);
    return <ErrorView error={err?.message} onRetry={handleFetchProfileAgain} />;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  debugButton: {
    padding: spacing.sm,
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
  },
  debugButtonText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fonts.sizes.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fonts.sizes.md,
    color: colors.danger,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  errorDetailText: {
    fontSize: fonts.sizes.sm,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});