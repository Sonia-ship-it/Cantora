import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';

// Screen Imports
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import StudioDashboard from './src/screens/StudioDashboard';

export default function App() {
  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  // Navigation state: 'welcome' | 'login' | 'forgot_password' | 'signup' | 'studio'
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userName, setUserName] = useState('Vocalist');

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d9b9ff" />
        <StatusBar style="light" />
      </View>
    );
  }

  // Navigation handlers
  const handleGetStarted = () => {
    setCurrentScreen('signup');
  };

  const handleLoginTransition = () => {
    setCurrentScreen('login');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleForgotPasswordTransition = () => {
    setCurrentScreen('forgot_password');
  };

  const handleSignUpTransition = () => {
    setCurrentScreen('signup');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  // Action handlers
  const handleEnterStudio = (email, password, rememberSession) => {
    if (!email || !password) {
      Alert.alert('Authentication Failed', 'Please fill in all fields.');
      return;
    }
    
    // Extract a display name from email (mock auth)
    const displayName = email.split('@')[0];
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    setUserName(capitalizedName);
    
    // Transition to dashboard
    setCurrentScreen('studio');
  };

  const handleSignUp = (fullName, email, password) => {
    if (!fullName || !email || !password) {
      Alert.alert('Registration Failed', 'Please fill in all fields.');
      return;
    }
    
    setUserName(fullName);
    setCurrentScreen('studio');
  };

  const handleSendResetLink = (email) => {
    Alert.alert(
      'Reset Link Sent',
      `A password reset instructions email has been sent to ${email}.`,
      [{ text: 'OK', onPress: () => setCurrentScreen('login') }]
    );
  };

  const handleLogout = () => {
    setCurrentScreen('welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGetStarted={handleGetStarted}
          onLogin={handleLoginTransition}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onBack={handleBackToWelcome}
          onForgotPassword={handleForgotPasswordTransition}
          onJoinCantora={handleSignUpTransition}
          onEnterStudio={handleEnterStudio}
        />
      )}

      {currentScreen === 'forgot_password' && (
        <ForgotPasswordScreen
          onBack={handleBackToLogin}
          onSignIn={handleBackToLogin}
          onSendResetLink={handleSendResetLink}
        />
      )}

      {currentScreen === 'signup' && (
        <SignUpScreen
          onBack={handleBackToWelcome}
          onSignIn={handleLoginTransition}
          onSignUp={handleSignUp}
        />
      )}

      {currentScreen === 'studio' && (
        <StudioDashboard
          user={userName}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a17',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0a17',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
