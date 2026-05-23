import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api } from '../../services/api';

interface ProfileTabProps {
  user: string;
  email?: string;
  onLogout: () => void;
  voicePart?: string;
  phone?: string;
  onProfileUpdate: (updatedName: string, updatedVoicePart: string) => void;
}

export default function ProfileTab({ user, email, onLogout, voicePart, phone, onProfileUpdate }: ProfileTabProps) {
  const displayName = user || 'Vocalist';
  const displayEmail = email || `${user.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
  const displayVoicePart = voicePart || 'Alto';

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editVoicePart, setEditVoicePart] = useState(displayVoicePart);
  const [isSaving, setIsSaving] = useState(false);

  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    setEditName(displayName);
    setEditVoicePart(displayVoicePart);
  }, [user, voicePart]);

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.updateMe({
        full_name: editName.trim(),
        voice_part: editVoicePart.toLowerCase(),
      });

      onProfileUpdate(response.full_name || editName.trim(), response.voice_part || editVoicePart);
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password.');
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
        'New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 digit, and 1 special character (@$!%*?&).'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password.');
      return;
    }

    setIsPasswordSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Your password has been changed successfully.');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      Alert.alert('Password Change Failed', err.message || 'Could not change password.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

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
        
        {/* Edit Profile */}
        <TouchableOpacity 
          style={styles.settingsCard} 
          activeOpacity={0.75}
          onPress={() => setIsEditing(!isEditing)}
        >
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Edit Profile</Text>
          </View>
          <Feather name={isEditing ? "chevron-up" : "chevron-down"} size={18} color="#d9b9ff" />
        </TouchableOpacity>

        {isEditing && (
          <View style={styles.editFormContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Full Name"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <Text style={styles.inputLabel}>VOICE PART</Text>
            <View style={styles.voicePartGrid}>
              {['Soprano', 'Alto', 'Tenor', 'Bass'].map((part) => {
                const isSelected = editVoicePart.toLowerCase() === part.toLowerCase();
                return (
                  <TouchableOpacity
                    key={part}
                    style={[
                      styles.voicePartButton,
                      isSelected && styles.voicePartButtonActive,
                    ]}
                    onPress={() => setEditVoicePart(part)}
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

            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#16122b" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Change Password */}
        <TouchableOpacity 
          style={styles.settingsCard} 
          activeOpacity={0.75}
          onPress={() => setIsChangingPassword(!isChangingPassword)}
        >
          <View style={styles.settingsCardLeft}>
            <View style={styles.iconContainer}>
              <Feather name="lock" size={18} color="#ffffff" />
            </View>
            <Text style={styles.settingsLabel}>Change Password</Text>
          </View>
          <Feather name={isChangingPassword ? "chevron-up" : "chevron-down"} size={18} color="#d9b9ff" />
        </TouchableOpacity>

        {isChangingPassword && (
          <View style={styles.editFormContainer}>
            <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoComplete="current-password"
            />

            <Text style={styles.inputLabel}>NEW PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoComplete="new-password"
            />

            <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Re-enter new password"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              secureTextEntry
              autoComplete="new-password"
            />

            <Text style={styles.passwordHelperText}>
              Must have 8+ characters, 1 uppercase letter, 1 digit, and 1 special character (@$!%*?&)
            </Text>

            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                disabled={isPasswordSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.formButton, styles.saveButton]}
                onPress={handleChangePassword}
                disabled={isPasswordSaving}
              >
                {isPasswordSaving ? (
                  <ActivityIndicator size="small" color="#16122b" />
                ) : (
                  <Text style={styles.saveButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  editFormContainer: {
    backgroundColor: 'rgba(23, 20, 38, 0.4)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 185, 255, 0.08)',
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    paddingHorizontal: 12,
    fontFamily: 'Lexend_400Regular',
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
  },
  passwordHelperText: {
    fontFamily: 'Lexend_300Light',
    fontSize: 11,
    color: 'rgba(217, 185, 255, 0.45)',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
    lineHeight: 15,
  },
  voicePartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  voicePartButton: {
    width: '48%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  voicePartButtonActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  voicePartButtonText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  voicePartButtonTextActive: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#16122b',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelButtonText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    backgroundColor: '#d9b9ff',
  },
  saveButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#16122b',
  },
});
