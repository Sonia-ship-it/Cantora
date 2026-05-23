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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { api } from '../../services/api';

interface HomeTabProps {
  onNavigateToUpload: () => void;
  onNavigateToRecord: () => void;
}

type SubTab = 'library' | 'choirs' | 'practice';

export default function HomeTab({ onNavigateToUpload, onNavigateToRecord }: HomeTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('library');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Library / Sheets state
  const [sheets, setSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<any | null>(null);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  // Choirs state
  const [choirs, setChoirs] = useState<any[]>([]);
  const [selectedChoir, setSelectedChoir] = useState<any | null>(null);
  const [isLoadingChoirs, setIsLoadingChoirs] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [choirName, setChoirName] = useState('');
  const [choirDesc, setChoirDesc] = useState('');

  // Practice state
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);
  const [activePracticeSession, setActivePracticeSession] = useState<any | null>(null);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [isLoadingAiPlan, setIsLoadingAiPlan] = useState(false);
  const [isStartPracticeModalVisible, setIsStartPracticeModalVisible] = useState(false);
  
  // Practice form
  const [practiceSheetId, setPracticeSheetId] = useState('');
  const [practiceVoicePart, setPracticeVoicePart] = useState('alto');
  const [practiceStartMeasure, setPracticeStartMeasure] = useState('1');
  const [practiceEndMeasure, setPracticeEndMeasure] = useState('16');
  const [practiceSpeed, setPracticeSpeed] = useState(1.0);

  // Load Initial Data
  useEffect(() => {
    fetchSheets();
    fetchChoirs();
    fetchPracticeSessions();
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

  const fetchChoirs = async () => {
    setIsLoadingChoirs(true);
    try {
      const data = await api.listChoirs();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setChoirs(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      console.log('Error fetching choirs:', err);
    } finally {
      setIsLoadingChoirs(false);
    }
  };

  const fetchPracticeSessions = async () => {
    setIsLoadingPractice(true);
    try {
      const data = await api.listPracticeSessions();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setPracticeSessions(Array.isArray(arr) ? arr : []);
    } catch (err: any) {
      console.log('Error fetching practice sessions:', err);
    } finally {
      setIsLoadingPractice(false);
    }
  };

  // Choir Operations
  const handleJoinChoir = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Validation Error', 'Please enter an invite code.');
      return;
    }
    setIsLoadingChoirs(true);
    try {
      const res = await api.joinChoir(inviteCode.trim());
      Alert.alert('Joined Choir', `Successfully joined choir: ${res.name || 'New Choir'}`);
      setInviteCode('');
      setIsJoinModalVisible(false);
      fetchChoirs();
    } catch (err: any) {
      Alert.alert('Join Failed', err.message || 'Could not join choir.');
    } finally {
      setIsLoadingChoirs(false);
    }
  };

  const handleCreateChoir = async () => {
    if (!choirName.trim()) {
      Alert.alert('Validation Error', 'Please enter a choir name.');
      return;
    }
    setIsLoadingChoirs(true);
    try {
      const res = await api.createChoir(choirName.trim(), choirDesc.trim() || undefined);
      Alert.alert('Choir Created', `Successfully created choir: ${res.name}`);
      setChoirName('');
      setChoirDesc('');
      setIsCreateModalVisible(false);
      fetchChoirs();
    } catch (err: any) {
      Alert.alert('Creation Failed', err.message || 'Could not create choir.');
    } finally {
      setIsLoadingChoirs(false);
    }
  };

  const handleRegenerateInvite = async (choirId: string) => {
    setIsLoadingChoirs(true);
    try {
      const res = await api.regenerateChoirInvite(choirId);
      if (selectedChoir && selectedChoir.id === choirId) {
        setSelectedChoir({ ...selectedChoir, invite_code: res.invite_code });
      }
      Alert.alert('Invite Code Regenerated', `New Invite Code: ${res.invite_code}`);
      fetchChoirs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not regenerate invite code.');
    } finally {
      setIsLoadingChoirs(false);
    }
  };

  const handleRemoveMember = async (choirId: string, userId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this choir?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoadingChoirs(true);
            try {
              await api.removeChoirMember(choirId, userId);
              Alert.alert('Removed Member', 'Member has been removed successfully.');
              
              // Refresh details
              const updatedChoir = await api.getChoir(choirId);
              setSelectedChoir(updatedChoir);
              fetchChoirs();
            } catch (err: any) {
              Alert.alert('Removal Failed', err.message || 'Could not remove member.');
            } finally {
              setIsLoadingChoirs(false);
            }
          }
        }
      ]
    );
  };

  // Practice Operations
  const handleStartPractice = async () => {
    if (!practiceSheetId) {
      Alert.alert('Validation Error', 'Please select a sheet music to practice.');
      return;
    }

    setIsLoadingPractice(true);
    try {
      const payload = {
        sheet_music_id: practiceSheetId,
        voice_part: practiceVoicePart,
        loop_start_measure: parseInt(practiceStartMeasure) || 1,
        loop_end_measure: parseInt(practiceEndMeasure) || 16,
        playback_speed: practiceSpeed,
      };

      const res = await api.startPractice(payload);
      setActivePracticeSession(res);
      setAiPlan(null); // Clear previous plan
      setIsStartPracticeModalVisible(false);
      Alert.alert('Practice Session Started', 'Good luck with your practice!');
      fetchPracticeSessions();
    } catch (err: any) {
      Alert.alert('Start Practice Failed', err.message || 'Could not start practice session.');
    } finally {
      setIsLoadingPractice(false);
    }
  };

  const handleFetchAiPlan = async (sessionId: string) => {
    setIsLoadingAiPlan(true);
    try {
      const plan = await api.getAiPracticePlan(sessionId);
      setAiPlan(plan);
      Alert.alert('AI Plan Generated', 'Your personalized practice roadmap is ready.');
    } catch (err: any) {
      Alert.alert('AI Plan Error', err.message || 'Could not fetch AI plan.');
    } finally {
      setIsLoadingAiPlan(false);
    }
  };

  const handleCompletePractice = async (sessionId: string) => {
    setIsLoadingPractice(true);
    try {
      const data = {
        notes: 'Completed practice session successfully.',
        duration_seconds: 600, // mock duration
      };
      const res = await api.completePractice(sessionId, data);
      Alert.alert('Practice Completed!', 'Your session has been logged and completed.');
      setActivePracticeSession(null);
      setAiPlan(null);
      fetchPracticeSessions();
    } catch (err: any) {
      Alert.alert('Complete Practice Failed', err.message || 'Could not complete session.');
    } finally {
      setIsLoadingPractice(false);
    }
  };

  // Filter sheets based on search
  const safeSheets = Array.isArray(sheets) ? sheets : [];
  const filteredSheets = safeSheets.filter(sheet => 
    sheet.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.composer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Sub-tab selection */}
      <View style={styles.subTabBar}>
        <TouchableOpacity 
          onPress={() => { setSubTab('library'); setSelectedSheet(null); }}
          style={[styles.subTabButton, subTab === 'library' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, subTab === 'library' && styles.subTabTextActive]}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => { setSubTab('choirs'); setSelectedChoir(null); }}
          style={[styles.subTabButton, subTab === 'choirs' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, subTab === 'choirs' && styles.subTabTextActive]}>Choirs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSubTab('practice')}
          style={[styles.subTabButton, subTab === 'practice' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, subTab === 'practice' && styles.subTabTextActive]}>Practice</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollSpacing}>

          {/* ========================================== */}
          {/* LIBRARY / SHEETS TAB                       */}
          {/* ========================================== */}
          {subTab === 'library' && !selectedSheet && (
            <View>
              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <Feather name="search" size={18} color="rgba(255, 255, 255, 0.4)" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search library compositions..."
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Text style={styles.sectionHeader}>ALL SHEETS</Text>

              {isLoadingSheets ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 30 }} />
              ) : filteredSheets.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Feather name="music" size={32} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>No sheet music found in your library.</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={onNavigateToUpload}>
                    <Text style={styles.emptyBtnText}>Upload First Score</Text>
                  </TouchableOpacity>
                </GlassCard>
              ) : (
                <View style={styles.listGrid}>
                  {filteredSheets.map((sheet) => (
                    <TouchableOpacity 
                      key={sheet.id} 
                      style={styles.songCard}
                      onPress={async () => {
                        setIsLoadingSheets(true);
                        try {
                          const detailedSheet = await api.getSheet(sheet.id);
                          setSelectedSheet(detailedSheet);
                        } catch (err) {
                          setSelectedSheet(sheet);
                        } finally {
                          setIsLoadingSheets(false);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.songCardLeft}>
                        <View style={styles.songThumbnail}>
                          <MaterialCommunityIcons name="file-music" size={24} color="#d9b9ff" />
                        </View>
                        <View style={styles.songInfo}>
                          <Text style={styles.songType}>{sheet.status || 'PROCESSED'}</Text>
                          <Text style={styles.songTitle} numberOfLines={1}>{sheet.title || 'Untitled Sheet'}</Text>
                          <Text style={styles.songComposer} numberOfLines={1}>{sheet.composer || 'Unknown Composer'}</Text>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Sheet Detailed View */}
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
                <View style={styles.illustrationPlaceholder}>
                  <LinearGradient
                    colors={['rgba(217, 185, 255, 0.15)', 'rgba(217, 185, 255, 0.03)']}
                    style={styles.illustrationGradient}
                  >
                    <MaterialCommunityIcons name="music-clef-treble" size={70} color="#d9b9ff" />
                    <Text style={styles.illustrationText}>{selectedSheet.title?.toUpperCase()}</Text>
                  </LinearGradient>
                </View>

                <Text style={styles.detailLabel}>SHEET MUSIC DETAILS</Text>
                <Text style={styles.detailTitle}>{selectedSheet.title || 'Untitled Score'}</Text>
                <Text style={styles.detailComposer}>{selectedSheet.composer || 'Unknown Composer'}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>ID: {selectedSheet.id.substring(0, 8)}...</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>STATUS: {selectedSheet.processing_status || selectedSheet.status || 'READY'}</Text>
                  </View>
                </View>

                <View style={styles.formActionsRow}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                    onPress={() => {
                      setPracticeSheetId(selectedSheet.id);
                      setSubTab('practice');
                      setIsStartPracticeModalVisible(true);
                      setSelectedSheet(null);
                    }}
                  >
                    <Feather name="play" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={[styles.cancelButtonText, { color: '#ffffff' }]}>Practice</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton]} 
                    onPress={onNavigateToRecord}
                  >
                    <Text style={styles.saveButtonText}>Open Mixer</Text>
                    <Feather name="arrow-right" size={16} color="#16122b" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </View>
          )}

          {/* ========================================== */}
          {/* CHOIRS TAB                                 */}
          {/* ========================================== */}
          {subTab === 'choirs' && !selectedChoir && (
            <View>
              {/* Join / Create Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={[styles.actionButtonHeader, { backgroundColor: 'rgba(217, 185, 255, 0.15)' }]} 
                  onPress={() => setIsJoinModalVisible(true)}
                >
                  <Feather name="user-plus" size={18} color="#d9b9ff" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonHeaderText}>Join Choir</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButtonHeader, { backgroundColor: '#d9b9ff' }]} 
                  onPress={() => setIsCreateModalVisible(true)}
                >
                  <Feather name="plus" size={18} color="#16122b" style={{ marginRight: 8 }} />
                  <Text style={[styles.actionButtonHeaderText, { color: '#16122b' }]}>Create Choir</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionHeader}>MY CHOIRS</Text>

              {isLoadingChoirs ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 30 }} />
              ) : choirs.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Feather name="users" size={32} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>You are not a member of any choirs yet.</Text>
                  <Text style={styles.emptySubText}>Create your own or join using an invite code.</Text>
                </GlassCard>
              ) : (
                <View style={styles.listGrid}>
                  {choirs.map((choir) => (
                    <TouchableOpacity 
                      key={choir.id} 
                      style={styles.songCard}
                      onPress={async () => {
                        setIsLoadingChoirs(true);
                        try {
                          const detailed = await api.getChoir(choir.id);
                          setSelectedChoir(detailed);
                        } catch (err) {
                          setSelectedChoir(choir);
                        } finally {
                          setIsLoadingChoirs(false);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.songCardLeft}>
                        <View style={styles.songThumbnail}>
                          <Feather name="users" size={20} color="#d9b9ff" />
                        </View>
                        <View style={styles.songInfo}>
                          <Text style={styles.songTitle}>{choir.name}</Text>
                          <Text style={styles.songComposer} numberOfLines={1}>{choir.description || 'No description provided'}</Text>
                          <Text style={styles.inviteBadge}>CODE: {choir.invite_code}</Text>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.3)" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Choir Detailed View */}
          {subTab === 'choirs' && selectedChoir && (
            <View>
              <TouchableOpacity 
                style={styles.backLink} 
                onPress={() => setSelectedChoir(null)}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={16} color="#d9b9ff" />
                <Text style={styles.backLinkText}>Back to Choirs</Text>
              </TouchableOpacity>

              <GlassCard style={styles.detailCard}>
                <Text style={styles.detailLabel}>CHOIR ENSEMBLE</Text>
                <Text style={styles.detailTitle}>{selectedChoir.name}</Text>
                <Text style={styles.detailComposer}>{selectedChoir.description || 'No description provided.'}</Text>

                {/* Invite Code row */}
                <View style={styles.inviteDetailsCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteLabel}>INVITATION CODE</Text>
                    <Text style={styles.inviteCodeText}>{selectedChoir.invite_code || 'N/A'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.regenerateBtn} 
                    onPress={() => handleRegenerateInvite(selectedChoir.id)}
                    disabled={isLoadingChoirs}
                  >
                    <Feather name="refresh-cw" size={14} color="#16122b" />
                    <Text style={styles.regenerateBtnText}>Regen</Text>
                  </TouchableOpacity>
                </View>

                {/* Members list */}
                <Text style={[styles.sectionHeader, { marginTop: 24, marginBottom: 8 }]}>MEMBERS</Text>
                {(!selectedChoir.members || selectedChoir.members.length === 0) ? (
                  <Text style={styles.noMembersText}>No members in this choir yet.</Text>
                ) : (
                  selectedChoir.members.map((member: any) => (
                    <View key={member.id} style={styles.memberItemRow}>
                      <View style={styles.memberAvatarCircle}>
                        <Text style={styles.avatarInitial}>{member.full_name?.charAt(0) || 'U'}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.full_name || member.email}</Text>
                        <Text style={styles.memberRole}>{member.role?.toUpperCase() || 'MEMBER'} • {member.voice_part?.toUpperCase() || 'ALT'}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeMemberBtn}
                        onPress={() => handleRemoveMember(selectedChoir.id, member.id, member.full_name || member.email)}
                      >
                        <Feather name="user-minus" size={16} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </GlassCard>
            </View>
          )}

          {/* ========================================== */}
          {/* PRACTICE TAB                               */}
          {/* ========================================== */}
          {subTab === 'practice' && (
            <View>
              {/* Start Practice Floating / Header Action */}
              <TouchableOpacity 
                style={styles.startPracticeBigBtn}
                onPress={() => {
                  if (sheets.length > 0 && !practiceSheetId) {
                    setPracticeSheetId(sheets[0].id);
                  }
                  setIsStartPracticeModalVisible(true);
                }}
              >
                <Feather name="play-circle" size={24} color="#16122b" />
                <Text style={styles.startPracticeBigBtnText}>Start New Practice Session</Text>
              </TouchableOpacity>

              {/* Active practice session dashboard */}
              {activePracticeSession && (
                <GlassCard style={[styles.detailCard, { borderColor: '#d9b9ff', borderWidth: 2, marginBottom: 24 }]}>
                  <View style={styles.activeSessionHeader}>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>ONGOING PRACTICE</Text>
                    </View>
                    <Text style={styles.activeSessionTime}>Active Now</Text>
                  </View>

                  <Text style={styles.detailTitle}>Practice: Part {activePracticeSession.voice_part?.toUpperCase() || 'ALTO'}</Text>
                  <Text style={styles.detailComposer}>Playback Speed: {activePracticeSession.playback_speed || '1.0'}x</Text>
                  <Text style={styles.detailDescription}>
                    Measures: {activePracticeSession.loop_start_measure || 1} to {activePracticeSession.loop_end_measure || 16}
                  </Text>

                  {/* AI Plan Section */}
                  {aiPlan ? (
                    <View style={styles.aiPlanContainer}>
                      <Text style={styles.aiPlanTitle}>🤖 AI Generated Practice Plan</Text>
                      <Text style={styles.aiPlanRoadmap}>{aiPlan.roadmap || aiPlan.plan || 'Plan loaded. Focus on bars 4-8 pitch intervals and dynamics.'}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.aiPlanRequestBtn}
                      onPress={() => handleFetchAiPlan(activePracticeSession.id)}
                      disabled={isLoadingAiPlan}
                    >
                      {isLoadingAiPlan ? (
                        <ActivityIndicator size="small" color="#d9b9ff" />
                      ) : (
                        <>
                          <Feather name="cpu" size={16} color="#d9b9ff" style={{ marginRight: 8 }} />
                          <Text style={styles.aiPlanRequestBtnText}>Get AI Practice Roadmap</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.enterRehearsalBtn, { backgroundColor: '#ff6b6b', marginTop: 16 }]}
                    onPress={() => handleCompletePractice(activePracticeSession.id)}
                    disabled={isLoadingPractice}
                  >
                    <Feather name="check-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={[styles.enterRehearsalBtnText, { color: '#ffffff' }]}>Complete & Log Practice</Text>
                  </TouchableOpacity>
                </GlassCard>
              )}

              <Text style={styles.sectionHeader}>PAST SESSIONS</Text>

              {isLoadingPractice ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 30 }} />
              ) : practiceSessions.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Feather name="clock" size={32} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>No practice history logged yet.</Text>
                  <Text style={styles.emptySubText}>Consistency is key. Record a session to begin.</Text>
                </GlassCard>
              ) : (
                practiceSessions.map((session) => (
                  <GlassCard key={session.id} style={styles.practiceSessionItem}>
                    <View style={styles.practiceItemLeft}>
                      <View style={styles.practiceIconBox}>
                        <Feather name="check" size={18} color="#d9b9ff" />
                      </View>
                      <View style={styles.practiceInfoText}>
                        <Text style={styles.practiceVoiceText}>Voice Part: {session.voice_part?.toUpperCase() || 'ALTO'}</Text>
                        <Text style={styles.practiceMetaText}>Speed: {session.playback_speed || '1.0'}x • Measures {session.loop_start_measure}-{session.loop_end_measure}</Text>
                        <Text style={styles.practiceDateText}>{new Date(session.created_at || Date.now()).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <View style={styles.practiceStatusBadge}>
                      <Text style={styles.practiceStatusText}>{session.completed ? 'DONE' : 'INCOMPLETE'}</Text>
                    </View>
                  </GlassCard>
                ))
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ========================================== */}
      {/* MODALS & POPUPS                            */}
      {/* ========================================== */}
      
      {/* Join Choir Modal */}
      <Modal visible={isJoinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Ensemble</Text>
            <Text style={styles.modalDescription}>Enter the invitation code shared by your choir director.</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Invite Code (e.g. CHOIR-XYZ)"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={inviteCode}
              onChangeText={setInviteCode}
            />

            <View style={styles.formActionsRow}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                onPress={() => setIsJoinModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]} 
                onPress={handleJoinChoir}
              >
                <Text style={styles.saveButtonText}>Join Choir</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Create Choir Modal */}
      <Modal visible={isCreateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Choir</Text>
            <Text style={styles.modalDescription}>Establish a new choral group and invite members.</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Choir Name"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={choirName}
              onChangeText={setChoirName}
            />

            <TextInput
              style={[styles.textInput, { height: 70 }]}
              placeholder="Description (Optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={choirDesc}
              onChangeText={setChoirDesc}
              multiline
            />

            <View style={styles.formActionsRow}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]} 
                onPress={handleCreateChoir}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Start Practice Modal */}
      <Modal visible={isStartPracticeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Practice</Text>
            
            {sheets.length === 0 ? (
              <View>
                <Text style={styles.modalDescription}>You need to upload sheet music before starting practice.</Text>
                <TouchableOpacity 
                  style={[styles.formButton, styles.saveButton, { marginTop: 12 }]}
                  onPress={() => { setIsStartPracticeModalVisible(false); onNavigateToUpload(); }}
                >
                  <Text style={styles.saveButtonText}>Go to Upload</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>SELECT SHEET MUSIC</Text>
                <ScrollView style={{ maxHeight: 110, marginBottom: 12 }}>
                  {sheets.map((s) => (
                    <TouchableOpacity 
                      key={s.id} 
                      style={[styles.sheetSelectRow, practiceSheetId === s.id && styles.sheetSelectRowActive]}
                      onPress={() => setPracticeSheetId(s.id)}
                    >
                      <Text style={[styles.sheetSelectText, practiceSheetId === s.id && styles.sheetSelectTextActive]} numberOfLines={1}>
                        {s.title || 'Untitled Score'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>VOICE PART</Text>
                <View style={[styles.voicePartGrid, { marginBottom: 12 }]}>
                  {['Soprano', 'Alto', 'Tenor', 'Bass'].map((p) => {
                    const isSel = practiceVoicePart === p.toLowerCase();
                    return (
                      <TouchableOpacity 
                        key={p} 
                        style={[styles.voicePartButton, { width: '23%', height: 32 }, isSel && styles.voicePartButtonActive]}
                        onPress={() => setPracticeVoicePart(p.toLowerCase())}
                      >
                        <Text style={[styles.voicePartButtonText, { fontSize: 11 }, isSel && styles.voicePartButtonTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.formActionsRow}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.inputLabel}>START BAR</Text>
                    <TextInput 
                      style={[styles.textInput, { marginBottom: 10 }]} 
                      keyboardType="numeric" 
                      value={practiceStartMeasure}
                      onChangeText={setPracticeStartMeasure}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.inputLabel}>END BAR</Text>
                    <TextInput 
                      style={[styles.textInput, { marginBottom: 10 }]} 
                      keyboardType="numeric" 
                      value={practiceEndMeasure}
                      onChangeText={setPracticeEndMeasure}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>PLAYBACK SPEED: {practiceSpeed}x</Text>
                <View style={styles.speedSelectorRow}>
                  {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <TouchableOpacity 
                      key={speed} 
                      style={[styles.speedBtn, practiceSpeed === speed && styles.speedBtnActive]}
                      onPress={() => setPracticeSpeed(speed)}
                    >
                      <Text style={[styles.speedBtnText, practiceSpeed === speed && styles.speedBtnTextActive]}>{speed}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.formActionsRow, { marginTop: 12 }]}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                    onPress={() => setIsStartPracticeModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton]} 
                    onPress={handleStartPractice}
                  >
                    <Text style={styles.saveButtonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </GlassCard>
        </View>
      </Modal>

    </View>
  );
}

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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    color: '#ffffff',
    fontSize: 13,
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
  listGrid: {
    marginTop: 4,
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
    paddingRight: 6,
  },
  songType: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 8,
    color: '#d9b9ff',
    letterSpacing: 0.5,
  },
  songTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
    marginTop: 1,
  },
  songComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  inviteBadge: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#d9b9ff',
    marginTop: 3,
  },
  // --- Detail views ---
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
  illustrationPlaceholder: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.1)',
  },
  illustrationGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#d9b9ff',
    letterSpacing: 2,
    marginTop: 10,
  },
  detailLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 1,
    marginBottom: 4,
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
    marginBottom: 12,
  },
  detailDescription: {
    fontFamily: 'Lexend_300Light',
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 18,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  metaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metaBadgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // --- Modals / Actions ---
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButtonHeader: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonHeaderText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  inviteDetailsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.2)',
  },
  inviteLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#d9b9ff',
    letterSpacing: 0.5,
  },
  inviteCodeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#ffffff',
    marginTop: 2,
  },
  regenerateBtn: {
    backgroundColor: '#d9b9ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  regenerateBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: '#16122b',
    marginLeft: 4,
  },
  noMembersText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginVertical: 10,
  },
  memberItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 185, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    fontFamily: 'Lexend_700Bold',
    color: '#d9b9ff',
    fontSize: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  memberRole: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  removeMemberBtn: {
    padding: 6,
  },
  // Practice UI
  startPracticeBigBtn: {
    height: 52,
    backgroundColor: '#d9b9ff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  startPracticeBigBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#16122b',
    marginLeft: 8,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 87, 87, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#eb5757',
    marginRight: 6,
  },
  liveText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#eb5757',
  },
  activeSessionTime: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#d9b9ff',
  },
  aiPlanContainer: {
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.2)',
  },
  aiPlanTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: '#d9b9ff',
    marginBottom: 4,
  },
  aiPlanRoadmap: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 16,
  },
  aiPlanRequestBtn: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9b9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  aiPlanRequestBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#d9b9ff',
  },
  enterRehearsalBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#d9b9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterRehearsalBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#16122b',
  },
  practiceSessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  practiceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(217, 185, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  practiceInfoText: {
    justifyContent: 'center',
  },
  practiceVoiceText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  practiceMetaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  practiceDateText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: 'rgba(217, 185, 255, 0.5)',
    marginTop: 1,
  },
  practiceStatusBadge: {
    backgroundColor: 'rgba(217, 185, 255, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  practiceStatusText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 8,
    color: '#d9b9ff',
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
    lineHeight: 16,
  },
  // Form input styles (reused)
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
  voicePartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voicePartButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  voicePartButtonActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  voicePartButtonText: {
    fontFamily: 'Lexend_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  voicePartButtonTextActive: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#16122b',
  },
  // Speed selector
  speedSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  speedBtn: {
    flex: 1,
    height: 30,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtnActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  speedBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  speedBtnTextActive: {
    color: '#16122b',
  },
  sheetSelectRow: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  sheetSelectRowActive: {
    backgroundColor: 'rgba(217, 185, 255, 0.15)',
  },
  sheetSelectText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sheetSelectTextActive: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#ffffff',
  },
});
