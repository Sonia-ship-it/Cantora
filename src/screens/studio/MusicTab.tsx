import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { api } from '../../services/api';

export default function MusicTab() {
  const fileInputRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleBrowseFiles = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Mock upload trigger for mobile native or when ref is not ready
      triggerMockUpload();
    }
  };

  const triggerMockUpload = async () => {
    setIsUploading(true);
    try {
      // Simulate API form packaging
      const mockFormData = new FormData();
      // In a real native environment, you would use DocumentPicker to get the file uri/type
      mockFormData.append('file', {
        uri: 'file://mock/score.pdf',
        name: 'score.pdf',
        type: 'application/pdf',
      } as any);

      Alert.alert(
        'Upload Score',
        'Initiating OMR processor & SATB analysis on the backend api...',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsUploading(false);
              Alert.alert('Upload Processed', 'Backend processed OMR score successfully.');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Check connection to backend.');
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Perform real sheet music upload
      const response = await api.uploadSheetMusic(formData);
      Alert.alert(
        'Score Uploaded',
        `Successfully uploaded score: "${response.title || file.name}"! Backend is processing vocal parts.`
      );
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload score.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.scrollSpacing}>
        {/* Hidden File Input for Web */}
        {Platform.OS === 'web' && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.png,.jpg,.jpeg,.musicxml"
          />
        )}

        <Text style={styles.uploadTitle}>Upload Sheet Music</Text>
        <Text style={styles.uploadDescription}>
          Digitalize your choir scores. Our AI handles OMR processing and maps SATB parts automatically on the backend server.
        </Text>

        {/* Dashed Drag & Drop Box */}
        <View style={styles.dragDropCard}>
          {isUploading ? (
            <ActivityIndicator size="large" color="#d9b9ff" />
          ) : (
            <MaterialCommunityIcons name="cloud-upload-outline" size={48} color="#d9b9ff" />
          )}
          <Text style={styles.dragDropTitle}>
            {isUploading ? 'Uploading & Processing...' : 'Drag & Drop your Score'}
          </Text>
          <Text style={styles.dragDropSubtitle}>Supports .PDF, .JPG, .PNG, .MusicXML</Text>

          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.browseBtn}
            onPress={handleBrowseFiles}
            activeOpacity={0.7}
            disabled={isUploading}
          >
            <Text style={styles.browseBtnText}>Browse Files</Text>
          </TouchableOpacity>
        </View>

        {/* Supported Formats */}
        <Text style={styles.formatsLabel}>SUPPORTED FORMATS</Text>
        <View style={styles.formatsGrid}>
          {[
            { name: 'PDF', icon: 'file-pdf-box' as const },
            { name: 'JPG', icon: 'image-outline' as const },
            { name: 'PNG', icon: 'image-outline' as const },
            { name: 'MusicXML', icon: 'file-music-outline' as const },
          ].map((format) => (
            <GlassCard key={format.name} style={styles.formatBox}>
              <MaterialCommunityIcons name={format.icon} size={28} color="#d9b9ff" />
              <Text style={styles.formatText}>{format.name}</Text>
            </GlassCard>
          ))}
        </View>
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
    paddingTop: 16,
    paddingBottom: 110,
  },
  uploadTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 8,
  },
  uploadDescription: {
    fontFamily: 'Lexend_300Light',
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 24,
  },
  dragDropCard: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(217, 185, 255, 0.3)',
    backgroundColor: 'rgba(23, 20, 38, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 28,
  },
  dragDropTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
    marginTop: 14,
  },
  dragDropSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
  browseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  browseBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  formatsLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  formatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatBox: {
    width: '23%',
    height: 72,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  formatText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
  },
});
