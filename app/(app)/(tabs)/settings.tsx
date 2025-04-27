import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
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
  const showDebugInfo = () => {
    const info = {
      userId: getUserId(),
      hasProfile: !!profile,
      profileData: profile,
      authUser: user?.id,
      profileError,
      profileLoading,
    };
    
    console.log('Debug Info:', JSON.stringify(info, null, 2));
    setDebugInfo(JSON.stringify(info, null, 2));
    
    Alert.alert(
      'Debug Info',
      `User ID: ${getUserId() || 'None'}\nProfile Loaded: ${!!profile}\nError: ${profileError || 'None'}`,
      [{ text: 'OK' }]
    );
  };
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('Loading profile, user ID:', getUserId());
        await fetchProfile();
        console.log('Profile state after fetch:', profile ? 'Loaded' : 'Not loaded');
      } catch (err) {
        console.error('Error in loadProfile effect:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, []);
  
  // Profile debug effect
  useEffect(() => {
    console.log('Profile state changed:', { 
      hasProfile: !!profile, 
      isLoading, 
      profileLoading,
      error: profileError
    });
  }, [profile, isLoading, profileLoading, profileError]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  const handleToggleFlashlight = async (value: boolean) => {
    try {
      await toggleFlashlight(value);
    } catch (err) {
      console.error('Error toggling flashlight:', err);
    }
  };
  
  const handleToggleVibration = async (value: boolean) => {
    try {
      await toggleVibration(value);
    } catch (err) {
      console.error('Error toggling vibration:', err);
    }
  };
  
  const handleToggleTranscription = async (value: boolean) => {
    try {
      await toggleTranscription(value);
    } catch (err) {
      console.error('Error toggling transcription:', err);
    }
  };
  
  const handleSensitivityChange = async (value: number) => {
    try {
      await updateSensitivityLevel(Math.round(value));
    } catch (err) {
      console.error('Error updating sensitivity:', err);
    }
  };
  
  const handleFetchProfileAgain = async () => {
    try {
      setIsLoading(true);
      console.log('Re-fetching profile, user ID:', getUserId());
      await fetchProfile();
      console.log('Profile after re-fetch:', !!profile);
    } catch (err) {
      console.error('Error in fetchProfile retry:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
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
        
        {/* Simple loading indicator while profile loads */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : !profile ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Could not load profile settings</Text>
            {profileError && (
              <Text style={styles.errorDetailText}>Error: {profileError}</Text>
            )}
            <Button 
              title="Try Again" 
              onPress={handleFetchProfileAgain}
              style={styles.retryButton}
            />
          </View>
        ) : (
          <>
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
                  value={profile.enable_flashlight ?? false}
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
                  value={profile.enable_vibration ?? false}
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
                  value={profile.enable_transcription ?? false}
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
                  value={profile.sensitivity_level ?? 3}
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
          </>
        )}
        
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
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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