import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import CantoraLogo from '../components/CantoraLogo';
import HomeTab from './studio/HomeTab';
import RecordTab from './studio/RecordTab';
import MusicTab from './studio/MusicTab';
import ProfileTab from './studio/ProfileTab';

interface StudioDashboardProps {
  user: string;
  onLogout: () => void;
  voicePart?: string;
  phone?: string;
}

type TabType = 'home' | 'record' | 'music' | 'profile';

export default function StudioDashboard({ user = 'Sarah', onLogout, voicePart, phone }: StudioDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderHeader = (showBack = false, onBackPress?: () => void) => (
    <View style={styles.header}>
      {showBack && onBackPress ? (
        <TouchableOpacity onPress={onBackPress} style={styles.headerIconButton}>
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
      ) : (
        <CantoraLogo size={32} />
      )}
      <Text style={styles.headerTitle}>CANTORA</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Feather name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconButton}>
          <Feather name="more-vertical" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#16122b', '#0c0a17']} style={styles.gradientBackground}>
        
        {/* Render header based on active tab */}
        {activeTab === 'home' && renderHeader(false)}
        {activeTab === 'record' && renderHeader(true, () => setActiveTab('home'))}
        {activeTab === 'music' && renderHeader(true, () => setActiveTab('home'))}
        {activeTab === 'profile' && renderHeader(true, () => setActiveTab('home'))}

        {/* Tab contents */}
        {activeTab === 'home' && (
          <HomeTab 
            onNavigateToUpload={() => setActiveTab('music')}
            onNavigateToRecord={() => setActiveTab('record')}
          />
        )}
        {activeTab === 'record' && (
          <RecordTab 
            onBackToHome={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'music' && (
          <MusicTab />
        )}
        {activeTab === 'profile' && (
          <ProfileTab 
            user={user}
            onLogout={onLogout}
            voicePart={voicePart}
            phone={phone}
          />
        )}

        {/* Global Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {[
            { id: 'home' as const, label: 'Home', icon: 'home-outline', iconActive: 'home' },
            { id: 'record' as const, label: 'Record', icon: 'mic-outline', iconActive: 'mic' },
            { id: 'music' as const, label: 'Music', icon: 'musical-notes-outline', iconActive: 'musical-notes' },
            { id: 'profile' as const, label: 'Profile', icon: 'person-outline', iconActive: 'person' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? (tab.iconActive as any) : (tab.icon as any)}
                  size={22}
                  color={isActive ? '#d9b9ff' : 'rgba(255, 255, 255, 0.45)'}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a17',
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 255, 0.1)',
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 6,
    marginLeft: 12,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#110d24',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(217, 185, 255, 0.12)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#d9b9ff',
    fontFamily: 'Lexend_600SemiBold',
  },
});
