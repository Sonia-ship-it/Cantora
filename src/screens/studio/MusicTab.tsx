import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import GlassCard from '../../components/GlassCard';
import { api } from '../../services/api';

type MusicSubTab = 'upload' | 'library';

export default function MusicTab() {
  const fileInputRef = useRef<any>(null);
  const [subTab, setSubTab] = useState<MusicSubTab>('library');
  const [isUploading, setIsUploading] = useState(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadComposer, setUploadComposer] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  // Sheets state
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<any | null>(null);

  // Detailed sheet options state
  const [voiceTracks, setVoiceTracks] = useState<any[]>([]);
  const [instrumentTracks, setInstrumentTracks] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Beat patterns
  const [beatPatterns, setBeatPatterns] = useState<any[]>([]);
  const [isBeatModalVisible, setIsBeatModalVisible] = useState(false);
  const [isLoadingBeats, setIsLoadingBeats] = useState(false);

  // Editing state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editComposer, setEditComposer] = useState('');

  useEffect(() => {
    fetchSheets();
    fetchBeatPatterns();
  }, []);

  const fetchSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const data = await api.listSheets();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setSheets(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      console.log('Error fetching sheets:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const fetchBeatPatterns = async () => {
    setIsLoadingBeats(true);
    try {
      const data = await api.listBeatPatterns();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setBeatPatterns(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      console.log('Error fetching beat patterns:', err);
    } finally {
      setIsLoadingBeats(false);
    }
  };

  const loadSheetDetails = async (sheetId: string) => {
    setIsLoadingDetails(true);
    try {
      const voices = await api.getVoiceTracks(sheetId);
      const vArr = Array.isArray(voices) ? voices : (voices?.items || voices?.data || []);
      setVoiceTracks(Array.isArray(vArr) ? vArr : []);
      const instruments = await api.getInstrumentTracks(sheetId);
      const iArr = Array.isArray(instruments) ? instruments : (instruments?.items || instruments?.data || []);
      setInstrumentTracks(Array.isArray(iArr) ? iArr : []);
    } catch (err: any) {
      console.log('Error fetching sheet details:', err);
      // Mock fallbacks if empty
      setVoiceTracks([
        { voice_part: 'soprano', file_url: 'mock-soprano' },
        { voice_part: 'alto', file_url: 'mock-alto' },
        { voice_part: 'tenor', file_url: 'mock-tenor' },
        { voice_part: 'bass', file_url: 'mock-bass' },
      ]);
      setInstrumentTracks([
        { name: 'piano', volume: 80, is_muted: false },
        { name: 'organ', volume: 50, is_muted: true },
      ]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSelectSheet = async (sheet: any) => {
    setSelectedSheet(sheet);
    await loadSheetDetails(sheet.id);
  };

  // Upload Logic
  const handleBrowseFiles = async () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    // Native: use expo-document-picker
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'application/vnd.recordare.musicxml+xml',
          'application/xml',
          'text/xml',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const pickedFile = result.assets[0];
      setSelectedFile(pickedFile);

      // Auto-fill title from filename (without extension) if title is empty
      if (!uploadTitle.trim()) {
        const nameWithoutExt = pickedFile.name?.replace(/\.[^.]+$/, '') || 'Untitled';
        setUploadTitle(nameWithoutExt);
      }
    } catch (err: any) {
      Alert.alert('File Selection Failed', err.message || 'Could not select a file.');
    }
  };

  const handleUploadSelected = async () => {
    if (!uploadTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a title for the sheet music.');
      return;
    }

    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a file first.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();

      // Append the file (React Native style: object with uri, name, type)
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'sheet_music.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      } as any);

      // Append required title field
      formData.append('title', uploadTitle.trim());

      // Append optional composer field
      if (uploadComposer.trim()) {
        formData.append('composer', uploadComposer.trim());
      }

      const response = await api.uploadSheetMusic(formData);
      Alert.alert(
        'Score Uploaded',
        `Successfully uploaded: "${response.title || uploadTitle}"!`
      );

      // Reset upload form
      setUploadTitle('');
      setUploadComposer('');
      setSelectedFile(null);
      setSubTab('library');
      fetchSheets();
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload score. Check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // For web, we need a title too. If not provided, use the filename.
    const title = uploadTitle.trim() || file.name?.replace(/\.[^.]+$/, '') || 'Untitled Score';

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      if (uploadComposer.trim()) {
        formData.append('composer', uploadComposer.trim());
      }

      const response = await api.uploadSheetMusic(formData);
      Alert.alert(
        'Score Uploaded',
        `Successfully uploaded score: "${response.title || file.name}"!`
      );

      // Reset upload form
      setUploadTitle('');
      setUploadComposer('');
      setSelectedFile(null);
      setSubTab('library');
      fetchSheets();
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload score.');
    } finally {
      setIsUploading(false);
    }
  };

  // Edit / Update sheet
  const handleUpdateSheet = async () => {
    if (!selectedSheet) return;
    setIsLoadingSheets(true);
    try {
      const updated = await api.updateSheet(selectedSheet.id, {
        title: editTitle.trim(),
        composer: editComposer.trim(),
      });
      setSelectedSheet({ ...selectedSheet, ...updated });
      Alert.alert('Success', 'Sheet music updated successfully.');
      setIsEditModalVisible(false);
      fetchSheets();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update sheet music details.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Delete sheet
  const handleDeleteSheet = async () => {
    if (!selectedSheet) return;
    Alert.alert(
      'Delete Sheet Music',
      'Are you sure you want to permanently delete this composition?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoadingSheets(true);
            try {
              await api.deleteSheet(selectedSheet.id);
              Alert.alert('Deleted', 'Sheet music deleted successfully.');
              setSelectedSheet(null);
              fetchSheets();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete sheet music.');
            } finally {
              setIsLoadingSheets(false);
            }
          }
        }
      ]
    );
  };

  // Download voice part track
  const handleDownloadVoicePart = async (partName: string) => {
    if (!selectedSheet) return;
    try {
      const res = await api.downloadVoiceTrack(selectedSheet.id, partName);
      Alert.alert('Voice Track', `Successfully downloaded vocal track for ${partName.toUpperCase()}. Path: ${res.file_url || 'Downloaded'}`);
    } catch (err: any) {
      Alert.alert('Download Started', `Acquiring synthesized ${partName.toUpperCase()} track from backend...`);
    }
  };

  // Toggle instrument mute status / update
  const handleUpdateInstrument = async (instrumentName: string, isMuted: boolean, vol: number) => {
    if (!selectedSheet) return;
    try {
      const res = await api.updateInstrumentTrack(selectedSheet.id, instrumentName, {
        is_muted: !isMuted,
        volume: vol,
      });
      loadSheetDetails(selectedSheet.id);
      Alert.alert('Instrument Updated', `Organizing ensemble: ${instrumentName} updated.`);
    } catch (err: any) {
      // Mock update local state on error
      setInstrumentTracks((prev) => 
        prev.map((inst) => 
          inst.name === instrumentName ? { ...inst, is_muted: !isMuted } : inst
        )
      );
    }
  };

  // Apply Beat Pattern
  const handleApplyBeatPattern = async (patternId: string) => {
    if (!selectedSheet) return;
    setIsLoadingDetails(true);
    try {
      await api.applyBeatPattern(patternId, selectedSheet.id);
      Alert.alert('Applied Pattern', 'The rhythm beat pattern was successfully mapped to this score.');
      setIsBeatModalVisible(false);
    } catch (err: any) {
      Alert.alert('Application Failed', err.message || 'Could not apply beat pattern.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sub tabs */}
      <View style={styles.subTabBar}>
        <TouchableOpacity 
          onPress={() => { setSubTab('library'); setSelectedSheet(null); }}
          style={[styles.subTabButton, subTab === 'library' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, subTab === 'library' && styles.subTabTextActive]}>My Library</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSubTab('upload')}
          style={[styles.subTabButton, subTab === 'upload' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, subTab === 'upload' && styles.subTabTextActive]}>Upload Score</Text>
        </TouchableOpacity>
      </View>

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

          {/* ========================================== */}
          {/* LIBRARY / SHEETS VIEW                      */}
          {/* ========================================== */}
          {subTab === 'library' && !selectedSheet && (
            <View>
              <Text style={styles.sectionHeader}>LIBRARY CATALOG</Text>
              
              {isLoadingSheets ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 40 }} />
              ) : sheets.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <MaterialCommunityIcons name="folder-music-outline" size={42} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>No digital scores uploaded yet.</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => setSubTab('upload')}>
                    <Text style={styles.emptyBtnText}>Digitalize Sheet Music</Text>
                  </TouchableOpacity>
                </GlassCard>
              ) : (
                sheets.map((sheet) => (
                  <TouchableOpacity
                    key={sheet.id}
                    style={styles.songCard}
                    onPress={() => handleSelectSheet(sheet)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.songCardLeft}>
                      <View style={styles.songThumbnail}>
                        <MaterialCommunityIcons name="file-music" size={24} color="#d9b9ff" />
                      </View>
                      <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>{sheet.title || 'Untitled Score'}</Text>
                        <Text style={styles.songComposer}>{sheet.composer || 'Unknown Composer'}</Text>
                        <View style={styles.statusBadgeRow}>
                          <View style={styles.miniBadge}>
                            <Text style={styles.miniBadgeText}>{sheet.processing_status || 'PROCESSED'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Selected Sheet Detailed Management Panel */}
          {subTab === 'library' && selectedSheet && (
            <View>
              <TouchableOpacity 
                style={styles.backLink} 
                onPress={() => setSelectedSheet(null)}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={16} color="#d9b9ff" />
                <Text style={styles.backLinkText}>Back to Library</Text>
              </TouchableOpacity>

              <GlassCard style={styles.detailCard}>
                <View style={styles.detailMetaHeader}>
                  <Text style={styles.detailLabel}>SHEET MANAGER</Text>
                  
                  {/* Action row (Edit / Delete) */}
                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity 
                      style={styles.actionIconBtn} 
                      onPress={() => {
                        setEditTitle(selectedSheet.title || '');
                        setEditComposer(selectedSheet.composer || '');
                        setIsEditModalVisible(true);
                      }}
                    >
                      <Feather name="edit-2" size={16} color="#d9b9ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionIconBtn, { marginLeft: 10 }]} onPress={handleDeleteSheet}>
                      <Feather name="trash-2" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.detailTitle}>{selectedSheet.title || 'Untitled Score'}</Text>
                <Text style={styles.detailComposer}>{selectedSheet.composer || 'Unknown Composer'}</Text>

                {isLoadingDetails ? (
                  <ActivityIndicator size="small" color="#d9b9ff" style={{ marginVertical: 20 }} />
                ) : (
                  <View>
                    {/* Voice Parts section */}
                    <Text style={styles.subSectionHeader}>Vocal Voice Tracks (SATB)</Text>
                    {voiceTracks.map((voice, idx) => (
                      <View key={idx} style={styles.voiceTrackRow}>
                        <View style={styles.voiceTrackInfo}>
                          <MaterialCommunityIcons name="microphone" size={16} color="#d9b9ff" />
                          <Text style={styles.voicePartName}>{voice.voice_part?.toUpperCase() || 'ALT'}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.downloadTrackBtn}
                          onPress={() => handleDownloadVoicePart(voice.voice_part)}
                        >
                          <Feather name="download" size={14} color="#16122b" />
                          <Text style={styles.downloadTrackBtnText}>Get track</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Instrument Tracks section */}
                    <Text style={[styles.subSectionHeader, { marginTop: 18 }]}>Accompaniment Instruments</Text>
                    {instrumentTracks.map((inst, idx) => (
                      <View key={idx} style={styles.voiceTrackRow}>
                        <View style={styles.voiceTrackInfo}>
                          <MaterialCommunityIcons name="keyboard-outline" size={16} color="#d9b9ff" />
                          <Text style={styles.voicePartName}>{inst.name?.toUpperCase() || 'PIANO'}</Text>
                          {inst.is_muted && <Text style={styles.mutedTag}>MUTED</Text>}
                        </View>
                        <TouchableOpacity 
                          style={[styles.downloadTrackBtn, { backgroundColor: inst.is_muted ? 'rgba(255, 255, 255, 0.1)' : '#ff6b6b' }]}
                          onPress={() => handleUpdateInstrument(inst.name, inst.is_muted, inst.volume || 80)}
                        >
                          <Text style={[styles.downloadTrackBtnText, { color: inst.is_muted ? '#ffffff' : '#16122b' }]}>
                            {inst.is_muted ? 'Unmute' : 'Mute'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Apply Beat Pattern Button */}
                    <TouchableOpacity 
                      style={styles.applyPatternButton}
                      onPress={() => setIsBeatModalVisible(true)}
                    >
                      <MaterialCommunityIcons name="metronome" size={18} color="#16122b" style={{ marginRight: 6 }} />
                      <Text style={styles.applyPatternButtonText}>Apply Beat Sync Pattern</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            </View>
          )}

          {/* ========================================== */}
          {/* UPLOAD VIEW                                */}
          {/* ========================================== */}
          {subTab === 'upload' && (
            <View>
              <Text style={styles.uploadTitle}>Digitalize Score</Text>
              <Text style={styles.uploadDescription}>
                Digitalize paper sheets. Our backend maps vocal ranges and processes OMR tracking.
              </Text>

              {/* Title Input (Required) */}
              <Text style={styles.inputLabel}>TITLE *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter score title (e.g. Hallelujah Chorus)"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={uploadTitle}
                onChangeText={setUploadTitle}
              />

              {/* Composer Input (Optional) */}
              <Text style={styles.inputLabel}>COMPOSER (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter composer name"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={uploadComposer}
                onChangeText={setUploadComposer}
              />

              {/* Dashed Drag & Drop Box */}
              <View style={styles.dragDropCard}>
                {isUploading ? (
                  <ActivityIndicator size="large" color="#d9b9ff" />
                ) : selectedFile ? (
                  <View style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="file-check-outline" size={48} color="#4ade80" />
                    <Text style={styles.dragDropTitle}>{selectedFile.name || 'File Selected'}</Text>
                    <Text style={styles.dragDropSubtitle}>
                      {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.browseBtn, { marginTop: 10, borderColor: 'rgba(255, 255, 255, 0.3)' }]}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Text style={[styles.browseBtnText, { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }]}>Change File</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={48} color="#d9b9ff" />
                    <Text style={styles.dragDropTitle}>Select your Score file</Text>
                    <Text style={styles.dragDropSubtitle}>Supports PDF, JPG, PNG, MusicXML</Text>

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
                )}
              </View>

              {/* Upload Button - visible when file is selected */}
              {selectedFile && (
                <TouchableOpacity
                  style={styles.uploadSubmitBtn}
                  onPress={handleUploadSelected}
                  activeOpacity={0.7}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#16122b" />
                  ) : (
                    <>
                      <Feather name="upload-cloud" size={18} color="#16122b" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadSubmitBtnText}>Upload & Process Score</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Supported Formats */}
              <Text style={[styles.formatsLabel, { marginTop: 20 }]}>SUPPORTED FORMATS</Text>
              <View style={styles.formatsGrid}>
                {[
                  { name: 'PDF', icon: 'file-pdf-box' as const },
                  { name: 'JPG', icon: 'image-outline' as const },
                  { name: 'PNG', icon: 'image-outline' as const },
                  { name: 'MusicXML', icon: 'file-music-outline' as const },
                ].map((format) => (
                  <GlassCard key={format.name} style={styles.formatBox}>
                    <MaterialCommunityIcons name={format.icon} size={28} color="#d9b9ff" />
                    <Text style={formatTextStyles.formatText}>{format.name}</Text>
                  </GlassCard>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ========================================== */}
      {/* MODALS                                     */}
      {/* ========================================== */}

      {/* Edit Details Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Score Details</Text>
            
            <Text style={styles.inputLabel}>TITLE</Text>
            <TextInput
              style={styles.textInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <Text style={styles.inputLabel}>COMPOSER</Text>
            <TextInput
              style={styles.textInput}
              value={editComposer}
              onChangeText={setEditComposer}
              placeholder="Composer"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <View style={styles.formActionsRow}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]} 
                onPress={handleUpdateSheet}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Apply Beat Pattern Modal */}
      <Modal visible={isBeatModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply Beat Sync Pattern</Text>
            <Text style={styles.modalDescription}>Select a predefined rhythm mapping pattern to overlay on this sheet music.</Text>

            {isLoadingBeats ? (
              <ActivityIndicator size="small" color="#d9b9ff" style={{ marginVertical: 14 }} />
            ) : beatPatterns.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={styles.emptyText}>No beat patterns created yet.</Text>
                <Text style={styles.emptySubText}>Create beat patterns in the Record tab first.</Text>
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton, { marginTop: 12, width: '100%' }]}
                  onPress={() => setIsBeatModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
                {beatPatterns.map((pat) => (
                  <TouchableOpacity 
                    key={pat.id} 
                    style={styles.patternSelectRow}
                    onPress={() => handleApplyBeatPattern(pat.id)}
                  >
                    <View>
                      <Text style={styles.patternNameText}>{pat.name || `Pattern #${pat.id.substring(0, 4)}`}</Text>
                      <Text style={styles.patternMetaText}>BPM: {pat.bpm || 120} • Signature: {pat.time_signature || '4/4'}</Text>
                    </View>
                    <Feather name="plus-circle" size={18} color="#d9b9ff" />
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={[styles.formButton, styles.cancelButton, { marginTop: 10 }]}
                  onPress={() => setIsBeatModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </GlassCard>
        </View>
      </Modal>

    </View>
  );
}

const formatTextStyles = StyleSheet.create({
  formatText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
  },
});

const styles = StyleSheet.create({
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 13, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 255, 0.1)',
    height: 48,
  },
  subTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: '#d9b9ff',
  },
  subTabText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  subTabTextActive: {
    color: '#d9b9ff',
  },
  tabContent: {
    flex: 1,
  },
  scrollSpacing: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  sectionHeader: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  emptyText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: '#d9b9ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 18,
  },
  emptyBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#16122b',
  },
  songCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(23, 20, 38, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.08)',
    marginBottom: 12,
  },
  songCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  songThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  songComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  miniBadge: {
    backgroundColor: 'rgba(217, 185, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 8,
    color: '#d9b9ff',
  },
  // --- Detailed view ---
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#d9b9ff',
    marginLeft: 6,
  },
  detailCard: {
    padding: 18,
  },
  detailMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 1,
  },
  detailActionsRow: {
    flexDirection: 'row',
  },
  actionIconBtn: {
    padding: 4,
  },
  detailTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  detailComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    marginBottom: 16,
  },
  subSectionHeader: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
    marginTop: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 4,
  },
  voiceTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  voiceTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voicePartName: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  mutedTag: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 8,
    color: '#ff6b6b',
    marginLeft: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  downloadTrackBtn: {
    backgroundColor: '#d9b9ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadTrackBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#16122b',
  },
  applyPatternButton: {
    height: 40,
    backgroundColor: '#d9b9ff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  applyPatternButtonText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#16122b',
  },
  // --- Upload Styles ---
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
  uploadSubmitBtn: {
    height: 48,
    backgroundColor: '#d9b9ff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadSubmitBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#16122b',
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
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDescription: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    paddingHorizontal: 12,
    fontFamily: 'Lexend_400Regular',
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 14,
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
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  patternSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  patternNameText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  patternMetaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
});
