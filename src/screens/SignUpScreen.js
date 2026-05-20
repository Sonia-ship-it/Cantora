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

export default function SignUpScreen({ onBack, onSignIn, onSignUp }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    onSignUp(fullName, email, password);
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
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
                  placeholder="KAMPIRE Sarah"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />

                {/* Vocalist Email */}
                <InputField
                  label="Vocalist Email"
                  iconName="mail"
                  placeholder="email@vocalist.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                {/* Password Input */}
                <InputField
                  label="Password"
                  iconName="lock"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
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
    paddingBottom: 40,
    justifyContent: 'center',
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
  },
  cardTitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
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
