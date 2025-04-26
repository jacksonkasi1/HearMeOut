import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
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
  const { 
    profile, 
    fetchProfile,
    toggleFlashlight,
    toggleVibration,
    toggleTranscription,
    updateSensitivityLevel,
  } = useProfileStore();
  const { signOut } = useAuthStore();
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleToggleFlashlight = async (value: boolean) => {
    await toggleFlashlight(value);
  };
  
  const handleToggleVibration = async (value: boolean) => {
    await toggleVibration(value);
  };
  
  const handleToggleTranscription = async (value: boolean) => {
    await toggleTranscription(value);
  };
  
  const handleSensitivityChange = async (value: number) => {
    await updateSensitivityLevel(Math.round(value));
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
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
              value={profile?.enable_flashlight ?? true}
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
              value={profile?.enable_vibration ?? true}
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
              value={profile?.enable_transcription ?? true}
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
              value={profile?.sensitivity_level ?? 3}
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
        
        {/* Account */}
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
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
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
});