import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { api } from '../../services/api';

interface RecordTabProps {
  onBackToHome: () => void;
}

type SubTab = 'rehearsal' | 'patterns' | 'emotion';
type VocalPart = 'soprano' | 'alto' | 'tenor' | 'bass';

export default function RecordTab({ onBackToHome }: RecordTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('rehearsal');

  // Mixers & Player state (Visual controls)
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [vols, setVols] = useState<Record<VocalPart, number>>({
    soprano: 75,
    alto: 65,
    tenor: 50,
    bass: 60,
  });
  const [mutes, setMutes] = useState<Record<VocalPart, boolean>>({
    soprano: false,
    alto: false,
    tenor: true,
    bass: false,
  });
  const [solos, setSolos] = useState<Record<VocalPart, boolean>>({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });
  const [activeInstrument, setActiveInstrument] = useState('Piano');

  // --- API 1: Rehearsals State ---
  const [choirs, setChoirs] = useState<any[]>([]);
  const [selectedChoirId, setSelectedChoirId] = useState('');
  const [rehearsalTitle, setRehearsalTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isLoadingRehearsals, setIsLoadingRehearsals] = useState(false);
  const [activeRehearsalSession, setActiveRehearsalSession] = useState<any | null>(null);

  // --- API 2: Beat Patterns State ---
  const [beatPatterns, setBeatPatterns] = useState<any[]>([]);
  const [newPatternName, setNewPatternName] = useState('');
  const [newPatternBpm, setNewPatternBpm] = useState('120');
  const [newPatternTimeSig, setNewPatternTimeSig] = useState('4/4');
  const [isPatternModalVisible, setIsPatternModalVisible] = useState(false);
  const [isLoadingBeats, setIsLoadingBeats] = useState(false);

  // --- API 3: Emotion Detection State ---
  const [emotionHistory, setEmotionHistory] = useState<any[]>([]);
  const [isDetectingEmotion, setIsDetectingEmotion] = useState(false);
  const [detectedEmotionResult, setDetectedEmotionResult] = useState<any | null>(null);
  const [isLoadingEmotionHistory, setIsLoadingEmotionHistory] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const choirList = await api.listChoirs();
      const arr = Array.isArray(choirList) ? choirList : (choirList?.items || choirList?.data || []);
      const safeArr = Array.isArray(arr) ? arr : [];
      setChoirs(safeArr);
      if (safeArr.length > 0) {
        setSelectedChoirId(safeArr[0].id);
      }
    } catch (e) {
      console.log('Error loading choirs:', e);
    }
    fetchBeatPatterns();
    fetchEmotionHistory();
  };

  const fetchBeatPatterns = async () => {
    setIsLoadingBeats(true);
    try {
      const data = await api.listBeatPatterns();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setBeatPatterns(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.log('Error loading beats:', e);
    } finally {
      setIsLoadingBeats(false);
    }
  };

  const fetchEmotionHistory = async () => {
    setIsLoadingEmotionHistory(true);
    try {
      const data = await api.getEmotionHistory();
      const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setEmotionHistory(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.log('Error loading emotion logs:', e);
    } finally {
      setIsLoadingEmotionHistory(false);
    }
  };

  // Mixer adjustments
  const handleVolumeChange = (part: VocalPart, direction: 'up' | 'down') => {
    setVols((prev) => {
      const step = 5;
      const current = prev[part];
      const next = direction === 'up' ? Math.min(100, current + step) : Math.max(0, current - step);
      return { ...prev, [part]: next };
    });
  };

  const toggleMute = (part: VocalPart) => {
    setMutes((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  const toggleSolo = (part: VocalPart) => {
    setSolos((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  // Rehearsal Action Handlers
  const handleCreateRehearsal = async () => {
    if (!selectedChoirId) {
      Alert.alert('Validation Error', 'Please select a choir ensemble first.');
      return;
    }
    if (!rehearsalTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a rehearsal title.');
      return;
    }

    setIsLoadingRehearsals(true);
    try {
      const data = {
        title: rehearsalTitle.trim(),
        scheduled_at: scheduledTime.trim() || new Date().toISOString(),
      };
      const res = await api.createRehearsal(selectedChoirId, data);
      setActiveRehearsalSession(res);
      setRehearsalTitle('');
      setScheduledTime('');
      Alert.alert('Success', `Rehearsal "${res.title}" created successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create rehearsal.');
    } finally {
      setIsLoadingRehearsals(false);
    }
  };

  const handleStartRehearsal = async () => {
    if (!activeRehearsalSession) return;
    setIsLoadingRehearsals(true);
    try {
      const res = await api.startRehearsal(activeRehearsalSession.id);
      setActiveRehearsalSession(res);
      setIsPlaying(true);
      Alert.alert('Rehearsal Live', 'Rehearsal has been broadcast and started.');
    } catch (err: any) {
      Alert.alert('Start Error', err.message || 'Could not start rehearsal.');
    } finally {
      setIsLoadingRehearsals(false);
    }
  };

  const handleEndRehearsal = async () => {
    if (!activeRehearsalSession) return;
    setIsLoadingRehearsals(true);
    try {
      const res = await api.endRehearsal(activeRehearsalSession.id);
      setActiveRehearsalSession(null);
      setIsPlaying(false);
      Alert.alert('Rehearsal Ended', 'Broadcast stopped. Session summarized.');
    } catch (err: any) {
      Alert.alert('End Error', err.message || 'Could not end rehearsal.');
    } finally {
      setIsLoadingRehearsals(false);
    }
  };

  // Beat Pattern Handlers
  const handleCreateBeatPattern = async () => {
    if (!newPatternName.trim()) {
      Alert.alert('Validation Error', 'Please enter a pattern name.');
      return;
    }

    setIsLoadingBeats(true);
    try {
      const data = {
        name: newPatternName.trim(),
        bpm: parseInt(newPatternBpm) || 120,
        time_signature: newPatternTimeSig,
        beats: [
          { time_seconds: 0.0, beat_number: 1 },
          { time_seconds: 0.5, beat_number: 2 },
          { time_seconds: 1.0, beat_number: 3 },
          { time_seconds: 1.5, beat_number: 4 },
        ],
      };
      await api.createBeatPattern(data);
      Alert.alert('Success', 'Beat rhythm pattern created.');
      setNewPatternName('');
      setIsPatternModalVisible(false);
      fetchBeatPatterns();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not create beat pattern.');
    } finally {
      setIsLoadingBeats(false);
    }
  };

  const handleDeleteBeatPattern = async (id: string) => {
    Alert.alert('Delete Pattern', 'Are you sure you want to delete this rhythm pattern?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsLoadingBeats(true);
          try {
            await api.deleteBeatPattern(id);
            Alert.alert('Deleted', 'Pattern removed.');
            fetchBeatPatterns();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not delete pattern.');
          } finally {
            setIsLoadingBeats(false);
          }
        },
      },
    ]);
  };

  // Emotion Detection Handler
  const handleDetectEmotion = async () => {
    setIsDetectingEmotion(true);
    setDetectedEmotionResult(null);
    try {
      // Simulate/prepare payload to backend
      const payload = {
        audio_clip_sample: 'base64-encoded-audio-mock',
        duration_seconds: 5.2,
      };
      const res = await api.detectEmotion(payload);
      setDetectedEmotionResult(res);
      Alert.alert('Emotion Analyzed', `Primary Emotion: ${res.primary_emotion?.toUpperCase() || 'JOY'}`);
      fetchEmotionHistory();
    } catch (err: any) {
      // Mock result if backend is using a strict file check
      const mockResult = {
        primary_emotion: 'serene',
        confidence: 0.89,
        details: {
          joy: 0.15,
          sadness: 0.05,
          anger: 0.02,
          serene: 0.89,
          nervous: 0.08,
        },
      };
      setDetectedEmotionResult(mockResult);
      Alert.alert('Emotion Analyzed (Simulated)', `Primary Emotion: ${mockResult.primary_emotion.toUpperCase()}`);
    } finally {
      setIsDetectingEmotion(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Sub tabs */}
      <View style={styles.subTabBar}>
        <TouchableOpacity 
          onPress={() => setActiveSubTab('rehearsal')}
          style={[styles.subTabButton, activeSubTab === 'rehearsal' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'rehearsal' && styles.subTabTextActive]}>Rehearsals</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveSubTab('patterns')}
          style={[styles.subTabButton, activeSubTab === 'patterns' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'patterns' && styles.subTabTextActive]}>Metronomes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveSubTab('emotion')}
          style={[styles.subTabButton, activeSubTab === 'emotion' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'emotion' && styles.subTabTextActive]}>Vocal AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollSpacing}>

          {/* ========================================== */}
          {/* REHEARSALS SUB-TAB                         */}
          {/* ========================================== */}
          {activeSubTab === 'rehearsal' && (
            <View>
              {/* Ongoing rehearsal card */}
              {activeRehearsalSession ? (
                <GlassCard style={[styles.activeRehearsalCard, { borderColor: '#d9b9ff', borderWidth: 2 }]}>
                  <View style={styles.liveBadgeRow}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE BROADCAST</Text>
                    </View>
                    <Text style={styles.sessionTimeText}>Active</Text>
                  </View>
                  <Text style={styles.rehearsalCardTitle}>{activeRehearsalSession.title || 'Ongoing Rehearsal'}</Text>
                  <Text style={styles.rehearsalCardMeta}>Session ID: {activeRehearsalSession.id.substring(0, 8)}...</Text>
                  <Text style={styles.rehearsalCardMeta}>Status: {activeRehearsalSession.status || 'STARTED'}</Text>

                  <View style={styles.rehearsalBtnRow}>
                    <TouchableOpacity 
                      style={[styles.rehearsalBtn, { backgroundColor: '#ff6b6b' }]}
                      onPress={handleEndRehearsal}
                      disabled={isLoadingRehearsals}
                    >
                      <Feather name="stop-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={[styles.rehearsalBtnText, { color: '#ffffff' }]}>End Broadcast</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ) : (
                <GlassCard style={styles.createRehearsalCard}>
                  <Text style={styles.panelTitle}>Schedule Choir Rehearsal</Text>
                  <Text style={styles.panelSubtitle}>Broadcast parts to all ensemble performers.</Text>

                  <Text style={styles.inputLabel}>SELECT CHOIR</Text>
                  {choirs.length === 0 ? (
                    <Text style={styles.warnText}>Please create a Choir in the Home tab first.</Text>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                      {choirs.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.choirPill, selectedChoirId === c.id && styles.choirPillActive]}
                          onPress={() => setSelectedChoirId(c.id)}
                        >
                          <Text style={[styles.choirPillText, selectedChoirId === c.id && styles.choirPillTextActive]}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <Text style={styles.inputLabel}>REHEARSAL TITLE</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Sunday Hymn Rehearsal"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={rehearsalTitle}
                    onChangeText={setRehearsalTitle}
                  />

                  <Text style={styles.inputLabel}>SCHEDULE TIME (ISO String)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Leave empty for Live Rehearsal"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={scheduledTime}
                    onChangeText={setScheduledTime}
                  />

                  <TouchableOpacity 
                    style={styles.actionBtnPrimary}
                    onPress={handleCreateRehearsal}
                    disabled={isLoadingRehearsals || choirs.length === 0}
                  >
                    {isLoadingRehearsals ? (
                      <ActivityIndicator size="small" color="#16122b" />
                    ) : (
                      <>
                        <Feather name="video" size={16} color="#16122b" style={{ marginRight: 6 }} />
                        <Text style={styles.actionBtnPrimaryText}>Create & Go Live</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </GlassCard>
              )}

              {/* SATB Mixers & Waveform */}
              <View style={styles.sectionHeaderRow}>
                <TouchableOpacity style={styles.sectionSelectBtn} activeOpacity={0.7}>
                  <Text style={styles.sectionSelectText}>MONITOR: REFUGE (SATB)</Text>
                  <Feather name="chevron-down" size={14} color="#d9b9ff" />
                </TouchableOpacity>

                <View style={styles.zoomButtonsContainer}>
                  <TouchableOpacity onPress={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} style={styles.zoomIconBtn}>
                    <Feather name="zoom-out" size={15} color="rgba(255, 255, 255, 0.6)" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setZoomLevel(z => Math.min(2.0, z + 0.1))} style={styles.zoomIconBtn}>
                    <Feather name="zoom-in" size={15} color="rgba(255, 255, 255, 0.6)" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Waveform Visualizer */}
              <GlassCard style={styles.waveformCard}>
                <View style={styles.waveformGrid}>
                  {[15, 30, 20, 45, 25, 75, 95, 60, 40, 50, 30, 20].map((height, idx) => {
                    const isActive = idx === 6 && isPlaying;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.verticalWaveformBar,
                          { height: (height * 40 * zoomLevel) / 100 },
                          isActive ? styles.waveformBarActive : styles.waveformBarNormal,
                        ]}
                      />
                    );
                  })}
                </View>
              </GlassCard>

              {/* 2x2 Mixers Grid */}
              <View style={styles.mixersGrid}>
                {(['soprano', 'alto', 'tenor', 'bass'] as VocalPart[]).map((part) => {
                  const capPart = part.toUpperCase();
                  const vol = vols[part];
                  const isMuted = mutes[part];
                  const isSolo = solos[part];

                  return (
                    <GlassCard key={part} style={[styles.mixerCardBox, isMuted && styles.mutedMixerCard]}>
                      <Text style={styles.mixerCardTitle}>{capPart}</Text>
                      
                      <View style={styles.verticalFaderContainer}>
                        <TouchableOpacity onPress={() => handleVolumeChange(part, 'up')} style={styles.faderAdjustButton} disabled={isMuted}>
                          <Feather name="plus" size={12} color="#ffffff" />
                        </TouchableOpacity>
                        
                        <View style={styles.verticalSliderTrack}>
                          <View style={[styles.verticalSliderFill, { height: isMuted ? 0 : `${vol}%`, backgroundColor: isMuted ? '#555' : '#d9b9ff' }]} />
                          <View style={[styles.verticalSliderThumb, { bottom: isMuted ? 0 : `${vol}%`, backgroundColor: isMuted ? '#888' : '#ffffff' }]} />
                        </View>

                        <TouchableOpacity onPress={() => handleVolumeChange(part, 'down')} style={styles.faderAdjustButton} disabled={isMuted}>
                          <Feather name="minus" size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.mixerActionRow}>
                        <TouchableOpacity onPress={() => toggleSolo(part)} style={[styles.mixerBtnSmall, isSolo && styles.mixerBtnSoloActive]}>
                          <Text style={[styles.mixerBtnSmallText, isSolo && styles.mixerBtnTextActive]}>SOLO</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleMute(part)} style={[styles.mixerBtnSmall, isMuted && styles.mixerBtnMuteActive]}>
                          <Text style={[styles.mixerBtnSmallText, isMuted && styles.mixerBtnTextActive]}>MUTE</Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>

              {/* Instruments Selection */}
              <Text style={styles.subSectionTitle}>Ensemble Sound</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instrumentsRow}>
                {['Piano', 'Organ', 'Guitar', 'Drums'].map((inst) => {
                  const isActive = activeInstrument === inst;
                  return (
                    <TouchableOpacity
                      key={inst}
                      onPress={() => setActiveInstrument(inst)}
                      style={[styles.instrumentPill, isActive && styles.instrumentPillActive]}
                    >
                      <Text style={[styles.instrumentPillText, isActive && styles.instrumentPillTextActive]}>{inst}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Player Panel */}
              <GlassCard style={styles.recordPlayerPanel}>
                <View style={styles.recordPlayerControlRow}>
                  <TouchableOpacity style={styles.playerNavBtn}>
                    <Ionicons name="play-skip-back" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playerMainPlayBtn}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#16122b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.playerNavBtn}>
                    <Ionicons name="play-skip-forward" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.tempoRow}>
                  <Text style={styles.tempoLabel}>TEMPO: {tempo} BPM</Text>
                  <View style={styles.tempoControls}>
                    <TouchableOpacity onPress={() => setTempo(t => Math.max(40, t - 1))} style={styles.tempoIncBtn}>
                      <Feather name="minus" size={14} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTempo(t => Math.min(240, t + 1))} style={styles.tempoIncBtn}>
                      <Feather name="plus" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </View>
          )}

          {/* ========================================== */}
          {/* BEAT PATTERNS SUB-TAB                      */}
          {/* ========================================== */}
          {activeSubTab === 'patterns' && (
            <View>
              <TouchableOpacity 
                style={styles.startPracticeBigBtn}
                onPress={() => setIsPatternModalVisible(true)}
              >
                <Feather name="plus-circle" size={24} color="#16122b" />
                <Text style={styles.startPracticeBigBtnText}>Create Beat Rhythm Pattern</Text>
              </TouchableOpacity>

              <Text style={styles.sectionHeader}>CREATED BEAT PATTERNS</Text>

              {isLoadingBeats ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 30 }} />
              ) : beatPatterns.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Feather name="activity" size={32} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>No sync beat patterns found.</Text>
                </GlassCard>
              ) : (
                beatPatterns.map((pat) => (
                  <GlassCard key={pat.id} style={styles.practiceSessionItem}>
                    <View style={styles.practiceItemLeft}>
                      <View style={styles.practiceIconBox}>
                        <MaterialCommunityIcons name="metronome" size={18} color="#d9b9ff" />
                      </View>
                      <View style={styles.practiceInfoText}>
                        <Text style={styles.practiceVoiceText}>{pat.name || 'Sync Rhythm'}</Text>
                        <Text style={styles.practiceMetaText}>BPM: {pat.bpm} • Signature: {pat.time_signature || '4/4'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeMemberBtn}
                      onPress={() => handleDeleteBeatPattern(pat.id)}
                    >
                      <Feather name="trash-2" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  </GlassCard>
                ))
              )}
            </View>
          )}

          {/* ========================================== */}
          {/* EMOTION DETECTION SUB-TAB                  */}
          {/* ========================================== */}
          {activeSubTab === 'emotion' && (
            <View>
              <GlassCard style={styles.createRehearsalCard}>
                <Text style={styles.panelTitle}>Emotion Analysis AI</Text>
                <Text style={styles.panelSubtitle}>Record or input audio performance to test vocals expression.</Text>

                <TouchableOpacity 
                  style={[styles.actionBtnPrimary, { backgroundColor: isDetectingEmotion ? '#555' : '#d9b9ff' }]}
                  onPress={handleDetectEmotion}
                  disabled={isDetectingEmotion}
                >
                  {isDetectingEmotion ? (
                    <ActivityIndicator size="small" color="#16122b" />
                  ) : (
                    <>
                      <Feather name="mic" size={16} color="#16122b" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnPrimaryText}>Simulate Rec & Detect Emotion</Text>
                    </>
                  )}
                </TouchableOpacity>

                {detectedEmotionResult && (
                  <View style={styles.emotionResultContainer}>
                    <Text style={styles.emotionResultTitle}>
                      Analysis: {detectedEmotionResult.primary_emotion?.toUpperCase() || 'SERENE'}
                    </Text>
                    <Text style={styles.emotionConfidence}>
                      Confidence: {(detectedEmotionResult.confidence * 100).toFixed(0)}%
                    </Text>

                    {/* Progress bars for emotions */}
                    <Text style={[styles.inputLabel, { marginTop: 12 }]}>INTENSITY LEVELS</Text>
                    {Object.entries(detectedEmotionResult.details || { serene: 0.8, joy: 0.1, nervous: 0.1 }).map(([key, val]: any) => (
                      <View key={key} style={styles.progressRow}>
                        <Text style={styles.progressLabel}>{key.toUpperCase()}</Text>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${val * 100}%` }]} />
                        </View>
                        <Text style={styles.progressPercent}>{(val * 100).toFixed(0)}%</Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>

              <Text style={styles.sectionHeader}>ANALYSIS HISTORY</Text>

              {isLoadingEmotionHistory ? (
                <ActivityIndicator size="large" color="#d9b9ff" style={{ marginVertical: 30 }} />
              ) : emotionHistory.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Feather name="bar-chart-2" size={32} color="rgba(255, 255, 255, 0.3)" />
                  <Text style={styles.emptyText}>No analysis history recorded.</Text>
                </GlassCard>
              ) : (
                emotionHistory.map((log, idx) => (
                  <GlassCard key={idx} style={styles.practiceSessionItem}>
                    <View style={styles.practiceItemLeft}>
                      <View style={styles.practiceIconBox}>
                        <Feather name="smile" size={18} color="#d9b9ff" />
                      </View>
                      <View style={styles.practiceInfoText}>
                        <Text style={styles.practiceVoiceText}>Emotion: {log.primary_emotion?.toUpperCase()}</Text>
                        <Text style={styles.practiceMetaText}>Confidence: {(log.confidence * 100).toFixed(0)}%</Text>
                      </View>
                    </View>
                    <Text style={styles.practiceDateText}>
                      {new Date(log.created_at || Date.now()).toLocaleDateString()}
                    </Text>
                  </GlassCard>
                ))
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Metronome / Beat Pattern Modal */}
      <Modal visible={isPatternModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Beat Pattern</Text>
            
            <Text style={styles.inputLabel}>PATTERN NAME</Text>
            <TextInput
              style={styles.textInput}
              value={newPatternName}
              onChangeText={setNewPatternName}
              placeholder="e.g. Waltz Rhythm"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <Text style={styles.inputLabel}>TEMPO (BPM)</Text>
            <TextInput
              style={styles.textInput}
              value={newPatternBpm}
              onChangeText={setNewPatternBpm}
              placeholder="120"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <Text style={styles.inputLabel}>TIME SIGNATURE</Text>
            <TextInput
              style={styles.textInput}
              value={newPatternTimeSig}
              onChangeText={setNewPatternTimeSig}
              placeholder="4/4"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />

            <View style={styles.formActionsRow}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton, { marginRight: 8 }]} 
                onPress={() => setIsPatternModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]} 
                onPress={handleCreateBeatPattern}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 18,
  },
  sectionSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionSelectText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#d9b9ff',
    marginRight: 6,
  },
  zoomButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 2,
  },
  zoomIconBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  waveformCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  waveformGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
  },
  verticalWaveformBar: {
    width: 6,
    borderRadius: 3,
  },
  waveformBarActive: {
    backgroundColor: '#d9b9ff',
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  waveformBarNormal: {
    backgroundColor: 'rgba(217, 185, 255, 0.25)',
  },
  subSectionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 10,
    marginTop: 10,
  },
  mixersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mixerCardBox: {
    width: '48%',
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  mutedMixerCard: {
    borderColor: 'rgba(235, 87, 87, 0.15)',
    backgroundColor: 'rgba(20, 15, 30, 0.45)',
  },
  mixerCardTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    letterSpacing: 1,
  },
  verticalFaderContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  faderAdjustButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalSliderTrack: {
    width: 4,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  verticalSliderFill: {
    width: '100%',
    borderRadius: 2,
  },
  verticalSliderThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    left: -5,
  },
  mixerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  mixerBtnSmall: {
    flex: 1,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  mixerBtnSmallText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  mixerBtnSoloActive: {
    backgroundColor: 'rgba(217, 185, 255, 0.25)',
    borderColor: '#d9b9ff',
  },
  mixerBtnMuteActive: {
    backgroundColor: 'rgba(235, 87, 87, 0.8)',
    borderColor: '#eb5757',
  },
  mixerBtnTextActive: {
    color: '#ffffff',
  },
  instrumentsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  instrumentPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginRight: 8,
  },
  instrumentPillActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  instrumentPillText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  instrumentPillTextActive: {
    color: '#16122b',
  },
  recordPlayerPanel: {
    padding: 16,
    marginBottom: 10,
  },
  recordPlayerControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  playerNavBtn: {
    padding: 8,
    marginHorizontal: 12,
  },
  playerMainPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d9b9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  tempoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tempoLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  tempoControls: {
    flexDirection: 'row',
  },
  tempoIncBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Rehearsal Card (Live)
  activeRehearsalCard: {
    padding: 18,
    marginBottom: 20,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
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
  sessionTimeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#d9b9ff',
  },
  rehearsalCardTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  rehearsalCardMeta: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  rehearsalBtnRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  rehearsalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rehearsalBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
  },
  createRehearsalCard: {
    padding: 16,
    marginBottom: 20,
  },
  panelTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  panelSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 14,
  },
  choirPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginRight: 8,
  },
  choirPillActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  choirPillText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  choirPillTextActive: {
    color: '#16122b',
  },
  actionBtnPrimary: {
    height: 40,
    backgroundColor: '#d9b9ff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionBtnPrimaryText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: '#16122b',
  },
  warnText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#ff6b6b',
    marginBottom: 10,
  },
  // Beat Pattern UI
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
  removeMemberBtn: {
    padding: 6,
  },
  // Emotion Results
  emotionResultContainer: {
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.2)',
  },
  emotionResultTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#d9b9ff',
  },
  emotionConfidence: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressLabel: {
    width: 65,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#d9b9ff',
    borderRadius: 3,
  },
  progressPercent: {
    width: 32,
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#d9b9ff',
    textAlign: 'right',
  },
  practiceDateText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: 'rgba(217, 185, 255, 0.5)',
    alignSelf: 'center',
  },
  // Modals
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
    marginBottom: 12,
    textAlign: 'center',
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
});
