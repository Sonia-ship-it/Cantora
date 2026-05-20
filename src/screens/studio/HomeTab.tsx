import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';

interface HomeTabProps {
  onNavigateToUpload: () => void;
  onNavigateToRecord: () => void;
}

export default function HomeTab({ onNavigateToUpload, onNavigateToRecord }: HomeTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hymns');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  if (selectedSong === 'awakening') {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollSpacing}>
          <TouchableOpacity 
            style={styles.backLink} 
            onPress={() => setSelectedSong(null)}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={16} color="#d9b9ff" />
            <Text style={styles.backLinkText}>Back to Library</Text>
          </TouchableOpacity>

          <GlassCard style={styles.detailCard}>
            <View style={styles.illustrationPlaceholder}>
              <LinearGradient
                colors={['rgba(217, 185, 255, 0.1)', 'rgba(217, 185, 255, 0.03)']}
                style={styles.illustrationGradient}
              >
                <MaterialCommunityIcons name="book-open-page-variant" size={80} color="#d9b9ff" />
                <Text style={styles.illustrationText}>THE AWAKENING CHORUS</Text>
              </LinearGradient>
            </View>

            <Text style={styles.detailLabel}>CONTEMPORARY MASTERPIECE</Text>
            <Text style={styles.detailTitle}>The Awakening Chorus</Text>
            <Text style={styles.detailComposer}>Joseph M. Martin</Text>

            <Text style={styles.detailDescription}>
              A powerful contemporary arrangement featuring complex SATB harmonies and a driving piano accompaniment. 
              Perfect for intermediate and advanced ensembles.
            </Text>

            <View style={styles.detailActionsContainer}>
              <TouchableOpacity style={styles.detailActionButton} activeOpacity={0.7}>
                <Feather name="file-text" size={18} color="#d9b9ff" style={styles.buttonIcon} />
                <Text style={styles.detailActionButtonText}>Full Score</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.detailActionButton} activeOpacity={0.7}>
                <Feather name="mic" size={18} color="#d9b9ff" style={styles.buttonIcon} />
                <Text style={styles.detailActionButtonText}>Vocal Only</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.detailActionButton} activeOpacity={0.7}>
                <Feather name="layers" size={18} color="#d9b9ff" style={styles.buttonIcon} />
                <Text style={styles.detailActionButtonText}>Stems</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.enterRehearsalBtn}
              onPress={onNavigateToRecord}
              activeOpacity={0.8}
            >
              <Text style={styles.enterRehearsalBtnText}>Open in Mixer Rehearsal</Text>
              <Feather name="arrow-right" size={18} color="#16122b" />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollSpacing}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Feather name="search" size={18} color="rgba(255, 255, 255, 0.4)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search compositions, composers, or arrangers"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {['All Music', 'Hymns', 'Contemporary'].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Featured Song Card */}
          <TouchableOpacity 
            style={styles.featuredCard} 
            onPress={() => setSelectedSong('awakening')}
            activeOpacity={0.9}
          >
            <View style={styles.featuredImageContainer}>
              <LinearGradient
                colors={['#241b3d', '#130d24']}
                style={styles.featuredGradient}
              >
                <MaterialCommunityIcons name="music-clef-treble" size={54} color="#d9b9ff" style={{ opacity: 0.8 }} />
                <Text style={styles.featuredGraphicLabel}>STUDIO SCORE</Text>
              </LinearGradient>
            </View>
            <View style={styles.featuredTextContent}>
              <Text style={styles.featuredTag}>CONTEMPORARY MASTERPIECE</Text>
              <Text style={styles.featuredTitle}>The Awakening Chorus</Text>
              <Text style={styles.featuredComposer}>Joseph M. Martin</Text>
              <View style={styles.featuredFooter}>
                <View style={styles.heartContainer}>
                  <Feather name="heart" size={16} color="#d9b9ff" />
                </View>
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  A powerful arrangement featuring complex SATB harmonies and driving piano accompaniment.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Song list cards */}
          <View style={styles.songListContainer}>
            {[
              { title: 'Hallelujah Chorus', type: 'CHOIR', composer: 'George Frideric Handel', icon: 'account-group' as const },
              { title: 'Amazing Grace', type: 'HYMN', composer: 'John Newton', icon: 'piano' as const },
              { title: 'Be Thou My Vision', type: 'HYMN', composer: 'Traditional Irish', icon: 'file-music' as const },
              { title: 'Messa di Gloria', type: 'ORCHESTRAL', composer: 'Giacomo Puccini', icon: 'music-clef-bass' as const },
            ].map((song, index) => (
              <View key={index} style={styles.songCard}>
                <View style={styles.songCardLeft}>
                  <View style={styles.songThumbnail}>
                    <MaterialCommunityIcons name={song.icon} size={24} color="#d9b9ff" />
                  </View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songType}>{song.type}</Text>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songComposer}>{song.composer}</Text>
                    <View style={styles.songDetailsRow}>
                      <Feather name="list" size={12} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 6 }} />
                      <Feather name="mic" size={12} color="rgba(255, 255, 255, 0.4)" />
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.likeButton}>
                  <Feather name="heart" size={16} color="rgba(255, 255, 255, 0.4)" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating action button (FAB) */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={onNavigateToUpload}
        activeOpacity={0.8}
      >
        <Feather name="upload" size={18} color="#16122b" style={{ marginRight: 8 }} />
        <Text style={styles.fabText}>Upload Sheet Music</Text>
      </TouchableOpacity>
    </View>
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
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: '#d9b9ff',
    borderColor: '#d9b9ff',
  },
  categoryPillText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  categoryPillTextActive: {
    color: '#16122b',
  },
  featuredCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(23, 20, 38, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.12)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  featuredImageContainer: {
    height: 140,
    backgroundColor: '#241b3d',
  },
  featuredGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  featuredGraphicLabel: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 1,
  },
  featuredTextContent: {
    padding: 16,
  },
  featuredTag: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: '#d9b9ff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  featuredTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  featuredComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  heartContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 185, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featuredDescription: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 16,
  },
  songListContainer: {
    marginTop: 10,
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
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songType: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#d9b9ff',
    letterSpacing: 0.5,
  },
  songTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
  },
  songComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  songDetailsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  likeButton: {
    padding: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 86,
    right: 20,
    backgroundColor: '#d9b9ff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#16122b',
  },

  // --- DETAIL VIEW STYLES ---
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backLinkText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#d9b9ff',
    marginLeft: 6,
  },
  detailCard: {
    padding: 16,
  },
  illustrationPlaceholder: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
    fontSize: 14,
    color: '#d9b9ff',
    letterSpacing: 2,
    marginTop: 12,
  },
  detailLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: '#d9b9ff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 22,
    color: '#ffffff',
  },
  detailComposer: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    marginBottom: 16,
  },
  detailDescription: {
    fontFamily: 'Lexend_300Light',
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 24,
  },
  detailActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailActionButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.3)',
    backgroundColor: 'rgba(217, 185, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonIcon: {
    marginRight: 6,
  },
  detailActionButtonText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
  enterRehearsalBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#d9b9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterRehearsalBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 14,
    color: '#16122b',
    marginRight: 8,
  },
});
