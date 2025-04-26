import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing, borderRadius } from '@/constants/spacing';
import { fonts } from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signInWithEmail, loading } = useAuthStore();
  const router = useRouter();
  
  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    
    await signInWithEmail(email, password);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Feather name="alert-circle" size={48} color={colors.primary} />
              </View>
              <Text style={styles.title}>HearMeOut</Text>
              <Text style={styles.subtitle}>
                Emergency audio detection for the deaf and hard-of-hearing
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                fullWidth
              />
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text style={styles.registerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.xxxl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    height: 56,
  },
  inputIcon: {
    marginHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  eyeIcon: {
    padding: spacing.md,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
    marginLeft: spacing.xs,
  },
});