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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

interface LoginScreenProps {
  onBack: () => void;
  onForgotPassword: () => void;
  onJoinCantora: () => void;
  onEnterStudio: (email: string, password: string, rememberSession: boolean) => void;
}

export default function LoginScreen({
  onBack,
  onForgotPassword,
  onJoinCantora,
  onEnterStudio,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);

  const handleEnterStudio = () => {
    onEnterStudio(email, password, rememberSession);
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
              {/* Back Button or Header Area */}
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              {/* Title & Subtitle */}
              <View style={styles.headerContainer}>
                <Text style={styles.brandTitle}>CANTORA</Text>
                <View style={styles.underline} />
                <Text style={styles.brandSubtitle}>Precision of the Vocalist</Text>
              </View>

              {/* Welcome Back Glass Card */}
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Welcome Back</Text>

                {/* Vocalist Email */}
                <InputField
                  label="Vocalist Email"
                  iconName="mail"
                  placeholder="email@vocalist.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                />

                {/* Password Input */}
                <InputField
                  label="Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                  textContentType="password"
                  headerRight={
                    <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
                      <Text style={styles.forgotPasswordText}>Forgot password</Text>
                    </TouchableOpacity>
                  }
                />

                {/* Remember Session Switch */}
                <View style={styles.rememberContainer}>
                  <Switch
                    value={rememberSession}
                    onValueChange={setRememberSession}
                    trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#d9b9ff' }}
                    thumbColor={rememberSession ? '#3a0e63' : '#a599b5'}
                    ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                    style={Platform.OS === 'ios' ? styles.iosSwitch : undefined}
                  />
                  <Text style={styles.rememberText}>Remember session</Text>
                </View>

                {/* Enter Studio Button */}
                <PrimaryButton
                  title="Enter Studio"
                  variant="filled"
                  showChevrons
                  onPress={handleEnterStudio}
                  style={styles.submitButton}
                />

                {/* Join Cantora Link */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>New to the choir? </Text>
                  <TouchableOpacity onPress={onJoinCantora} activeOpacity={0.7}>
                    <Text style={styles.footerLink}>Join Cantora</Text>
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
  },
  cardTitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#d9b9ff',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  rememberText: {
    fontFamily: 'Lexend_300Light',
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 10,
  },
  iosSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
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
