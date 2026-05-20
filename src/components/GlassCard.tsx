import React from 'react';
import { StyleSheet, View } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(23, 20, 38, 0.65)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    // Shadow for iOS
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    // Elevation for Android
    elevation: 8,
  },
});
