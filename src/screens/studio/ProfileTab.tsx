import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileTabProps {
  user: string;
  onLogout: () => void;
  voicePart?: string;
  phone?: string;
}

export default function ProfileTab({ user, onLogout, voicePart, phone }: ProfileTabProps) {
  // Use "Elite Vocalist" by default to match screenshot perfectly
  const displayName = user === 'Vocalist' || user === 'Sarah' ? 'Elite Vocalist' : user;
  const displayEmail = user === 'Vocalist' || user === 'Sarah' ? 'admincantora@gmail.com' : `${user.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const displayVoicePart = voicePart || 'Alto';

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.scrollSpacing}>
        
        {/* Profile Info Row */}
        <View style={styles.profileHeaderRow}>
          {/* Avatar with beautiful purple outer glow */}
          <View style={[styles.avatarCircle, styles.avatarGlow]}>
            <Feather name="user" size={38} color="#16122b" />
          </View>
          
          {/* Text information */}
          <View style={styles.profileInfoTextContainer}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
            {phone ? <Text style={styles.profilePhone}>{phone}</Text> : null}
            
            {/* Vocal Section Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{displayVoicePart.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ACCOUNT SETTINGS SECTION */}
        <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
        
        {/* Edit Profile (Down chevron) */}
        <TouchableOpacity style={styles.settingsCard} activeOpacity={0.75}>
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Edit Profile</Text>
          </View>
          <Feather name="chevron-down" size={18} color="#d9b9ff" />
        </TouchableOpacity>

        {/* Notifications (Right chevron) */}
        <TouchableOpacity style={styles.settingsCard} activeOpacity={0.75}>
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="bell" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Notifications</Text>
          </View>
          <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        {/* Preferences (Right chevron) */}
        <TouchableOpacity style={styles.settingsCard} activeOpacity={0.75}>
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="settings" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Preferences</Text>
          </View>
          <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        {/* SUPPORT SECTION */}
        <Text style={styles.sectionHeader}>SUPPORT</Text>

        {/* Help Center & FAQ (Right chevron) */}
        <TouchableOpacity style={styles.settingsCard} activeOpacity={0.75}>
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="info" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Help Center & FAQ</Text>
          </View>
          <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        {/* LOG OUT BUTTON */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutCard} activeOpacity={0.75}>
          <View style={styles.logoutContent}>
            <Feather name="log-out" size={18} color="#ff6b6b" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  scrollSpacing: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#d9b9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    // Beautiful lavender outer glow shadow
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    // Android elevation support
    elevation: 12,
  },
  profileInfoTextContainer: {
    marginLeft: 20,
    justifyContent: 'center',
    flex: 1,
  },
  profileName: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 24,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(217, 185, 255, 0.75)',
    marginTop: 4,
  },
  profilePhone: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 185, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.3)',
  },
  badgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 1,
  },
  sectionHeader: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 16,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 20, 38, 0.65)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 185, 255, 0.12)',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  settingsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
    marginLeft: 14,
  },
  logoutCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 107, 0.25)',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#ff6b6b',
  },
});
