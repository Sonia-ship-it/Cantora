import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';

interface RecordTabProps {
  onBackToHome: () => void;
}

type VocalPart = 'soprano' | 'alto' | 'tenor' | 'bass';

export default function RecordTab({ onBackToHome }: RecordTabProps) {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [vols, setVols] = useState<Record<VocalPart, number>>({
    soprano: 75,
    alto: 65,
    tenor: 50,
    bass: 60,
  });
  const [mutes, setMutes] = useState<Record<VocalPart, boolean>>({
    soprano: false,
    alto: false,
    tenor: true, // Tenor muted to match screenshot 2
    bass: false,
  });
  const [solos, setSolos] = useState<Record<VocalPart, boolean>>({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });
  const [activeInstrument, setActiveInstrument] = useState('Piano');
  const [tempo, setTempo] = useState(124);
  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.scrollSpacing}>
        {/* Top selection row */}
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity style={styles.sectionSelectBtn} activeOpacity={0.7}>
            <Text style={styles.sectionSelectText}>SECTION: REFUGE (CHORUS)</Text>
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
              const isActive = idx === 6;
              return (
                <View
                  key={idx}
                  style={[
                    styles.verticalWaveformBar,
                    { height: (height * 40) / 100 },
                    isActive ? styles.waveformBarActive : styles.waveformBarNormal,
                  ]}
                />
              );
            })}
          </View>
        </GlassCard>

        {/* Mixers section title */}
        <View style={styles.subSectionHeader}>
          <Feather name="users" size={16} color="#d9b9ff" style={{ marginRight: 8 }} />
          <Text style={styles.subSectionTitle}>SATB Mixers</Text>
        </View>

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

                {/* Vertical Fader Slider */}
                <View style={styles.verticalFaderContainer}>
                  <TouchableOpacity 
                    onPress={() => handleVolumeChange(part, 'up')}
                    style={styles.faderAdjustButton}
                    disabled={isMuted}
                  >
                    <Feather name="plus" size={12} color="#ffffff" />
                  </TouchableOpacity>
                  
                  <View style={styles.verticalSliderTrack}>
                    <View 
                      style={[
                        styles.verticalSliderFill, 
                        { 
                          height: isMuted ? 0 : `${vol}%`,
                          backgroundColor: isMuted ? '#555' : '#d9b9ff'
                        }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.verticalSliderThumb, 
                        { 
                          bottom: isMuted ? 0 : `${vol}%`,
                          backgroundColor: isMuted ? '#888' : '#ffffff'
                        }
                      ]} 
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleVolumeChange(part, 'down')}
                    style={styles.faderAdjustButton}
                    disabled={isMuted}
                  >
                    <Feather name="minus" size={12} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Solo & Mute Buttons side-by-side */}
                <View style={styles.mixerActionRow}>
                  <TouchableOpacity
                    onPress={() => toggleSolo(part)}
                    style={[styles.mixerBtnSmall, isSolo && styles.mixerBtnSoloActive]}
                  >
                    <Text style={[styles.mixerBtnSmallText, isSolo && styles.mixerBtnTextActive]}>
                      SOLO
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => toggleMute(part)}
                    style={[styles.mixerBtnSmall, isMuted && styles.mixerBtnMuteActive]}
                  >
                    <Text style={[styles.mixerBtnSmallText, isMuted && styles.mixerBtnTextActive]}>
                      MUTE
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })}
        </View>

        {/* Instruments selection */}
        <View style={styles.subSectionHeader}>
          <MaterialCommunityIcons name="music-keyboard" size={18} color="#d9b9ff" style={{ marginRight: 8 }} />
          <Text style={styles.subSectionTitle}>Instruments</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instrumentsRow}>
          {[
            { name: 'Piano', icon: 'keyboard' as const },
            { name: 'Organ', icon: 'piano' as const },
            { name: 'Guitar', icon: 'guitar-acoustic' as const },
            { name: 'Drums', icon: 'drum' as const }
          ].map((inst) => {
            const isActive = activeInstrument === inst.name;
            return (
              <TouchableOpacity
                key={inst.name}
                onPress={() => setActiveInstrument(inst.name)}
                style={[styles.instrumentPill, isActive && styles.instrumentPillActive]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={inst.icon} 
                  size={14} 
                  color={isActive ? '#16122b' : 'rgba(255, 255, 255, 0.6)'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.instrumentPillText, isActive && styles.instrumentPillTextActive]}>
                  {inst.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Floating Player controls panel */}
        <GlassCard style={styles.recordPlayerPanel}>
          <View style={styles.recordPlayerControlRow}>
            <TouchableOpacity style={styles.playerNavBtn}>
              <Ionicons name="play-skip-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playerMainPlayBtn}
              activeOpacity={0.8}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#16122b" style={!isPlaying ? { marginLeft: 3 } : null} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playerNavBtn}>
              <Ionicons name="play-skip-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Tempo settings */}
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

          {/* Loop section and record actions */}
          <View style={styles.playerActionRow}>
            <TouchableOpacity style={styles.playerSubAction}>
              <Feather name="refresh-cw" size={14} color="#d9b9ff" style={{ marginRight: 6 }} />
              <Text style={styles.playerSubActionText}>LOOP SECTION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playerSubAction}>
              <Feather name="mic" size={14} color="#d9b9ff" style={{ marginRight: 6 }} />
              <Text style={styles.playerSubActionText}>RECORD</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  subSectionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  tempoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
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
  playerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  playerSubAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  playerSubActionText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 0.5,
  },
});
