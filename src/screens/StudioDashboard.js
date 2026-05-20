import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudioDashboard({ user = 'Sarah', onLogout }) {
  // Mock states for vocal mixer
  const [volumes, setVolumes] = useState({
    soprano: 85,
    alto: 70,
    tenor: 50,
    bass: 60,
  });

  const [mutes, setMutes] = useState({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });

  const [solos, setSolos] = useState({
    soprano: false,
    alto: false,
    tenor: false,
    bass: false,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState({
    title: 'Hallelujah Chorus (SATB)',
    composer: 'G.F. Handel',
    tempo: '112 BPM',
    key: 'D Major',
    progress: 35,
  });

  const toggleMute = (part) => {
    setMutes((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  const toggleSolo = (part) => {
    setSolos((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  const updateVolume = (part, amount) => {
    setVolumes((prev) => {
      const newVol = Math.max(0, Math.min(100, prev[part] + amount));
      return { ...prev, [part]: newVol };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#16122b', '#0c0a17']}
        style={styles.gradientBackground}
      >
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>CANTORA</Text>
            <Text style={styles.studioBadge}>STUDIO</Text>
          </View>
          <View style={styles.rightNav}>
            <TouchableOpacity style={styles.navIconButton} activeOpacity={0.7}>
              <Feather name="bell" size={20} color="#d9b9ff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.profileButton} activeOpacity={0.7}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user[0] || 'V'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View>
              <Text style={styles.welcomeText}>Hello, {user}</Text>
              <Text style={styles.subtext}>Ready for today's rehearsal?</Text>
            </View>
            <View style={styles.liveIndicatorContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Studio Connected</Text>
            </View>
          </View>

          {/* Active Rehearsal Track Card */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Rehearsal</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>Change Sheet</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trackCard}>
            <View style={styles.trackRow}>
              {/* Cover Art / Visualizer Mock */}
              <LinearGradient
                colors={['#3b1b63', '#d9b9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverArt}
              >
                <Feather name="music" size={32} color="#16122b" />
              </LinearGradient>
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {activeTrack.title}
                </Text>
                <Text style={styles.trackComposer}>{activeTrack.composer}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Feather name="clock" size={12} color="#d9b9ff" />
                    <Text style={styles.metaText}>{activeTrack.tempo}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <MaterialCommunityIcons name="music-clef-treble" size={12} color="#d9b9ff" />
                    <Text style={styles.metaText}>{activeTrack.key}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Simulated Waveform Visualizer */}
            <View style={styles.waveformContainer}>
              {[25, 45, 15, 60, 30, 80, 50, 75, 40, 20, 65, 90, 45, 30, 60, 80, 25, 10, 40, 60, 75, 25, 45, 55, 35].map((height, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.waveformBar,
                    { height: (height * 30) / 100 },
                    idx < 10 ? styles.waveformBarPlayed : styles.waveformBarRemaining,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Smart Rehearsal Vocal Mixer */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choral Mixer (SATB)</Text>
            <TouchableOpacity
              onPress={() =>
                setVolumes({ soprano: 80, alto: 80, tenor: 80, bass: 80 })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>Reset Levels</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mixerCard}>
            {Object.keys(volumes).map((part) => {
              const capitalizedPart = part.charAt(0).toUpperCase() + part.slice(1);
              const volume = volumes[part];
              const isMuted = mutes[part];
              const isSolo = solos[part];

              return (
                <View key={part} style={styles.mixerRow}>
                  {/* Part Label */}
                  <View style={styles.partLabelContainer}>
                    <Text style={styles.partLabel}>{capitalizedPart}</Text>
                    <Text style={styles.volumePercentage}>{isMuted ? 'Muted' : `${volume}%`}</Text>
                  </View>

                  {/* Fader / Slider controls */}
                  <View style={styles.faderContainer}>
                    <TouchableOpacity
                      onPress={() => updateVolume(part, -10)}
                      style={styles.faderBtn}
                      disabled={isMuted}
                    >
                      <Feather name="minus" size={14} color="#d9b9ff" />
                    </TouchableOpacity>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          {
                            width: `${isMuted ? 0 : volume}%`,
                            backgroundColor: isSolo ? '#d9b9ff' : 'rgba(217, 185, 255, 0.65)',
                          },
                        ]}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => updateVolume(part, 10)}
                      style={styles.faderBtn}
                      disabled={isMuted}
                    >
                      <Feather name="plus" size={14} color="#d9b9ff" />
                    </TouchableOpacity>
                  </View>

                  {/* Mute / Solo Buttons */}
                  <View style={styles.mixerActions}>
                    <TouchableOpacity
                      onPress={() => toggleMute(part)}
                      style={[styles.mixerButton, isMuted && styles.activeMute]}
                    >
                      <Text style={[styles.mixerButtonText, isMuted && styles.activeActionText]}>
                        M
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleSolo(part)}
                      style={[styles.mixerButton, isSolo && styles.activeSolo]}
                    >
                      <Text style={[styles.mixerButtonText, isSolo && styles.activeActionText]}>
                        S
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Global Persistent Player Bar */}
        <View style={styles.playerBar}>
          <LinearGradient
            colors={['rgba(28, 22, 51, 0.95)', '#141124']}
            style={styles.playerGradient}
          >
            {/* Play Progress Line */}
            <View style={styles.playerProgressContainer}>
              <View style={[styles.playerProgressFill, { width: `${activeTrack.progress}%` }]} />
              <View style={[styles.playerProgressHandle, { left: `${activeTrack.progress}%` }]} />
            </View>

            <View style={styles.playerControlRow}>
              {/* Song details in player */}
              <View style={styles.playerLeft}>
                <Text style={styles.playerTitle} numberOfLines={1}>
                  {activeTrack.title}
                </Text>
                <Text style={styles.playerSubtitle}>Rehearsing Bass & Alto</Text>
              </View>

              {/* Central playback controls */}
              <View style={styles.playerCenter}>
                <TouchableOpacity style={styles.playerSecondaryBtn}>
                  <Ionicons name="play-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                  style={styles.playerPlayBtn}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#16122b"
                    style={!isPlaying ? { marginLeft: 2 } : null}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.playerSecondaryBtn}>
                  <Ionicons name="play-forward" size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Rehearsal parameters */}
              <View style={styles.playerRight}>
                <TouchableOpacity style={styles.paramButton}>
                  <Text style={styles.paramText}>1.0x</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paramButton}>
                  <Text style={styles.paramText}>±0</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 255, 0.1)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d9b9ff',
    marginRight: 8,
  },
  brandText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  studioBadge: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    color: '#d9b9ff',
    backgroundColor: 'rgba(217, 185, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  rightNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconButton: {
    padding: 8,
    marginRight: 10,
  },
  profileButton: {
    padding: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#d9b9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#300a52',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // space for persistent player
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 185, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.08)',
  },
  welcomeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  subtext: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(217, 185, 255, 0.65)',
    marginTop: 2,
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 219, 137, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4adb89',
    marginRight: 6,
  },
  liveText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#4adb89',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#d9b9ff',
  },
  trackCard: {
    backgroundColor: 'rgba(23, 20, 38, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.12)',
    padding: 16,
    marginBottom: 24,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverArt: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackDetails: {
    flex: 1,
    marginLeft: 16,
  },
  trackTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  trackComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(217, 185, 255, 0.6)',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 185, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  metaText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#d9b9ff',
    marginLeft: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 35,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  waveformBar: {
    width: 3.5,
    borderRadius: 2,
  },
  waveformBarPlayed: {
    backgroundColor: '#d9b9ff',
  },
  waveformBarRemaining: {
    backgroundColor: 'rgba(217, 185, 255, 0.15)',
  },
  mixerCard: {
    backgroundColor: 'rgba(23, 20, 38, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.12)',
    padding: 16,
    marginBottom: 20,
  },
  mixerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 255, 0.06)',
  },
  partLabelContainer: {
    width: 70,
  },
  partLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  volumePercentage: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(217, 185, 255, 0.5)',
    marginTop: 2,
  },
  faderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  faderBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    marginHorizontal: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  mixerActions: {
    flexDirection: 'row',
  },
  mixerButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  mixerButtonText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: 'rgba(217, 185, 255, 0.65)',
  },
  activeMute: {
    backgroundColor: 'rgba(235, 87, 87, 0.15)',
    borderColor: '#eb5757',
  },
  activeSolo: {
    backgroundColor: 'rgba(217, 185, 255, 0.25)',
    borderColor: '#d9b9ff',
  },
  activeActionText: {
    color: '#ffffff',
  },
  playerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(217, 185, 255, 0.12)',
  },
  playerGradient: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  playerProgressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1.5,
    position: 'relative',
    marginBottom: 12,
  },
  playerProgressFill: {
    height: '100%',
    backgroundColor: '#d9b9ff',
    borderRadius: 1.5,
  },
  playerProgressHandle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d9b9ff',
    position: 'absolute',
    top: -3.5,
    transform: [{ translateX: -5 }],
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  playerControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerLeft: {
    width: '35%',
  },
  playerTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  playerSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#d9b9ff',
    opacity: 0.7,
    marginTop: 2,
  },
  playerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  playerSecondaryBtn: {
    padding: 8,
    marginHorizontal: 4,
  },
  playerPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d9b9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  playerRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '30%',
  },
  paramButton: {
    backgroundColor: 'rgba(217, 185, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 6,
  },
  paramText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#d9b9ff',
  },
});
