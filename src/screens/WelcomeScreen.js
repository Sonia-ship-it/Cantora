import React from 'react';
import { StyleSheet, Text, View, ImageBackground, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CantoraLogo from '../components/CantoraLogo';
import PrimaryButton from '../components/PrimaryButton';

export default function WelcomeScreen({ onGetStarted, onLogin }) {
  return (
    <ImageBackground
      source={require('../../assets/microphone_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(15, 12, 28, 0.4)', 'rgba(15, 12, 28, 0.85)', '#0c0a17']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />

          {/* Logo & Brand Content */}
          <View style={styles.topContainer}>
            {/* Blurred back circle (bokeh) for the logo */}
            <View style={styles.bokehContainer}>
              <View style={styles.logoBokeh} />
              <CantoraLogo size={300} />
            </View>

            <Text style={styles.brandTitle}>CANTORA</Text>

            <Text style={styles.brandSubtitle}>
              Master your voice in the digital concert hall. Precision rehearsal for elite vocalists.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.bottomContainer}>
            <PrimaryButton
              title="Get Started"
              variant="filled"
              onPress={onGetStarted}
              style={styles.buttonSpacing}
            />

            <PrimaryButton
              title="Login"
              variant="outline"
              onPress={onLogin}
              style={styles.buttonSpacing}
            />

            {/* Footer Text */}
            <Text style={styles.footerText}>
              REFINING THE ART OF CHORAL EXCELLENCE
            </Text>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  topContainer: {
    alignItems: 'center',
    marginTop: '1%',
  },
  bokehContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  logoBokeh: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(217, 185, 255, 0.12)',
  },
  brandTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 48,
    color: '#d9b9ff',
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: 'rgba(217, 185, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  brandSubtitle: {
    fontFamily: 'Lexend_300Light',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: '10%',
    width: '100%',
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  footerText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: 'rgba(217, 185, 255, 0.45)',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 28,
  },
});
