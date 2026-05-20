import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  variant?: 'filled' | 'outline';
  showChevrons?: boolean;
  onPress?: () => void;
  style?: any;
}

export default function PrimaryButton({
  title,
  variant = 'filled',
  showChevrons = false,
  onPress,
  style,
}: PrimaryButtonProps) {
  const isFilled = variant === 'filled';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        isFilled ? styles.filledButton : styles.outlineButton,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.text, isFilled ? styles.filledText : styles.outlineText]}>
          {title}
        </Text>
        {showChevrons && (
          <Text style={[styles.chevrons, isFilled ? styles.filledText : styles.outlineText]}>
            {' >>'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  filledButton: {
    backgroundColor: '#d9b9ff',
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  outlineButton: {
    backgroundColor: 'rgba(23, 20, 38, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 185, 255, 0.3)',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  filledText: {
    color: '#300a52',
  },
  outlineText: {
    color: '#ffffff',
  },
  chevrons: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
  },
});
