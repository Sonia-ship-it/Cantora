import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputFieldProps {
  label?: string;
  headerRight?: React.ReactNode;
  iconName?: any;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  autoComplete?: any;
  textContentType?: any;
}

export default function InputField({
  label,
  headerRight,
  iconName,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  autoComplete,
  textContentType,
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const shouldSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={[styles.container, style]}>
      {/* Label Row */}
      {(label || headerRight) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}

      {/* Input Row Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {/* Left Icon */}
        {iconName && (
          <Feather
            name={iconName}
            size={18}
            color={isFocused ? '#d9b9ff' : 'rgba(217, 185, 255, 0.4)'}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={[styles.input, secureTextEntry ? styles.inputPassword : null]}
          placeholder={placeholder}
          placeholderTextColor="rgba(217, 185, 255, 0.3)"
          secureTextEntry={shouldSecure}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor="#d9b9ff"
        />

        {/* Right Icon for Password Toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.rightIconContainer}
            activeOpacity={0.7}
          >
            <Feather
              name={passwordVisible ? 'eye-off' : 'eye'}
              size={18}
              color={isFocused ? '#d9b9ff' : 'rgba(217, 185, 255, 0.4)'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Lexend_300Light',
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#d9b9ff',
    backgroundColor: 'rgba(217, 185, 255, 0.08)',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: '#ffffff',
    height: '100%',
    // Dynamic platform selection casted to any to suppress TypeScript react-native validation
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }) as any,
  },
  inputPassword: {},
  rightIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
});
