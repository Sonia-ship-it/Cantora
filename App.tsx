import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
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

// API Service Import
import { api } from './src/services/api';

// Globally disable browser focus ring outlines on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    textarea, input, select, [role="textbox"], [tabindex="0"], *:focus {
      outline: none !important;
      outline-style: none !important;
      outline-width: 0 !important;
      box-shadow: none !important;
    }
    /* Suppress native autofill solid rectangular backgrounds */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px rgba(23, 20, 38, 0.9) inset !important;
      -webkit-text-fill-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  // Navigation state: 'welcome' | 'login' | 'forgot_password' | 'signup' | 'studio'
  const [currentScreen, setCurrentScreen] = useState<string>('welcome');
  const [userName, setUserName] = useState<string>('Vocalist');
  const [voicePart, setVoicePart] = useState<string>('Alto');
  const [phone, setPhone] = useState<string>('');
  
  // Network loading overlay state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d9b9ff" />
        <StatusBar style="light" />
      </View>
    );
  }

  // Navigation transitions
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

  // API Integrated Event Handlers
  const handleEnterStudio = async (email: string, password: string, rememberSession: boolean) => {
    if (!email || !password) {
      Alert.alert('Authentication Failed', 'Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Trigger backend login request
      await api.login(email, password);

      // 2. Fetch logged-in user profile details
      const userProfile = await api.getMe();

      // 3. Update global application states
      setUserName(userProfile.full_name);
      setVoicePart(userProfile.voice_part || 'Alto');
      setPhone(userProfile.phone_number || '');

      // 4. Transition to home dashboard
      setCurrentScreen('studio');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (
    fullName: string,
    email: string,
    password: string,
    voicePartSelection: string,
    phoneInput: string
  ) => {
    if (!fullName || !email || !password || !voicePartSelection) {
      Alert.alert('Registration Failed', 'Please fill in all required fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload: any = {
        email,
        password,
        fullName,
        voicePart: voicePartSelection,
      };

      if (phoneInput && phoneInput.trim().length > 0) {
        payload.phone = phoneInput.startsWith('+') ? phoneInput : `+${phoneInput}`;
      }

      console.log('Register payload:', payload);
      
      // 1. Perform backend user registration
      await api.register(payload);

      // 2. Automatically log the user in to receive session tokens
      await api.login(email, password);

      // 3. Retrieve registered user details
      const userProfile = await api.getMe();

      // 4. Persist info in global state
      setUserName(userProfile.full_name);
      setVoicePart(userProfile.voice_part || 'Alto');
      setPhone(userProfile.phone_number || '');

      // 5. Navigate to dashboard
      setCurrentScreen('studio');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async (email: string) => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      // Trigger backend forgot password link
      await api.forgotPassword(email);
      Alert.alert(
        'Reset Link Sent',
        `If the account exists, a password reset instructions email has been sent to ${email}.`,
        [{ text: 'OK', onPress: () => setCurrentScreen('login') }]
      );
    } catch (error: any) {
      Alert.alert('Reset Link Failed', error.message || 'Could not send reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Trigger API logout to clear session/token
      await api.logout();
    } catch (error) {
      console.log('Error logging out from server:', error);
    } finally {
      setIsLoading(false);
      setCurrentScreen('welcome');
    }
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
          voicePart={voicePart}
          phone={phone}
        />
      )}

      {/* Network activity spinner glass overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#d9b9ff" />
        </View>
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
