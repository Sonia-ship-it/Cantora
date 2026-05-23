import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

interface ResetPasswordScreenProps {
  onBack: () => void;
  onSignIn: () => void;
  onResetPassword: (token: string, newPassword: string) => void;
}

export default function ResetPasswordScreen({ onBack, onSignIn, onResetPassword }: ResetPasswordScreenProps) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter the reset token from your email.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 digit, and 1 special character (@$!%*?&).'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    onResetPassword(token.trim(), newPassword);
  };

  return (
    <ImageBackground
      source={require('../../assets/microphone_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(15, 12, 28, 0.6)', 'rgba(15, 12, 28, 0.9)', '#0c0a17']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Back Button */}
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              {/* Title & Subtitle */}
              <View style={styles.headerContainer}>
                <Text style={styles.brandTitle}>CANTORA</Text>
                <View style={styles.underline} />
                <Text style={styles.brandSubtitle}>Set your new password</Text>
              </View>

              {/* Reset Password Glass Card */}
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Reset Password</Text>

                <Text style={styles.instructionText}>
                  Enter the reset token sent to your email and choose a new password.
                </Text>

                {/* Reset Token */}
                <InputField
                  label="Reset Token"
                  iconName="key"
                  placeholder="Paste your reset token"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  autoComplete="off"
                />

                {/* New Password */}
                <InputField
                  label="New Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                />

                {/* Confirm Password */}
                <InputField
                  label="Confirm Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                />

                <Text style={styles.helperText}>
                  Must have 8+ characters, 1 uppercase letter, 1 digit, and 1 special character (@$!%*?&)
                </Text>

                {/* Reset Password Button */}
                <PrimaryButton
                  title="Set New Password"
                  variant="filled"
                  showChevrons
                  onPress={handleReset}
                  style={styles.submitButton}
                />

                {/* Sign In Link */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>Remember password? </Text>
                  <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: 'rgba(217, 185, 255, 0.6)',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  brandTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 42,
    color: '#d9b9ff',
    letterSpacing: 2,
  },
  underline: {
    width: 80,
    height: 2,
    backgroundColor: '#d9b9ff',
    marginTop: 4,
    borderRadius: 1,
    opacity: 0.8,
  },
  brandSubtitle: {
    fontFamily: 'Lexend_300Light',
    fontSize: 15,
    color: '#ffffff',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  card: {
    marginTop: 10,
    paddingVertical: 24,
  },
  cardTitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontFamily: 'Lexend_300Light',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  helperText: {
    fontFamily: 'Lexend_300Light',
    fontSize: 11,
    color: 'rgba(217, 185, 255, 0.45)',
    marginTop: -12,
    marginBottom: 16,
    paddingHorizontal: 4,
    lineHeight: 15,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Lexend_300Light',
    fontSize: 14,
    color: '#ffffff',
  },
  footerLink: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#d9b9ff',
  },
});
