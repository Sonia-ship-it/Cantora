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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';

interface SignUpScreenProps {
  onBack: () => void;
  onSignIn: () => void;
  onSignUp: (
    fullName: string,
    email: string,
    password: string,
    voicePart: string,
    phone: string
  ) => void;
}

type VoicePartType = 'Soprano' | 'Alto' | 'Tenor' | 'Bass';

export default function SignUpScreen({ onBack, onSignIn, onSignUp }: SignUpScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [voicePart, setVoicePart] = useState<VoicePartType>('Alto');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    onSignUp(fullName, email, password, voicePart, phone);
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
                <Text style={styles.brandSubtitle}>Begin your journey toward vocal excellence</Text>
              </View>

              {/* Join the Choir Glass Card */}
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>Join the Choir</Text>

                {/* Full Name */}
                <InputField
                  label="Full Name"
                  iconName="user"
                  placeholder="KAMPIRE Sarah"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                />

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

                {/* Phone Number */}
                <InputField
                  label="Phone Number"
                  iconName="phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />

                {/* Voice Part Segment Control */}
                <View style={styles.voicePartSection}>
                  <Text style={styles.inputLabel}>Voice Part</Text>
                  <View style={styles.voicePartButtonsRow}>
                    {(['Soprano', 'Alto', 'Tenor', 'Bass'] as VoicePartType[]).map((part) => {
                      const isSelected = voicePart === part;
                      return (
                        <TouchableOpacity
                          key={part}
                          onPress={() => setVoicePart(part)}
                          style={[
                            styles.voicePartButton,
                            isSelected && styles.voicePartButtonActive,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.voicePartButtonText,
                              isSelected && styles.voicePartButtonTextActive,
                            ]}
                          >
                            {part}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Password Input */}
                <InputField
                  label="Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="new-password"
                  textContentType="password"
                />

                {/* Enter Studio Button */}
                <PrimaryButton
                  title="Enter Studio"
                  variant="filled"
                  showChevrons
                  onPress={handleSignUp}
                  style={styles.submitButton}
                />

                {/* Sign In Link */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>Already a member ? </Text>
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
    marginBottom: 24,
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
    textAlign: 'center',
    paddingHorizontal: 16,
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
    marginBottom: 24,
  },
  voicePartSection: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontFamily: 'Lexend_300Light',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  voicePartButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  voicePartButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    backgroundColor: 'rgba(20, 15, 30, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  voicePartButtonActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  voicePartButtonText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  voicePartButtonTextActive: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#16122b',
  },
  submitButton: {
    marginTop: 12,
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
