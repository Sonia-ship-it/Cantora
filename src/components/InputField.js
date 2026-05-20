import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
}) {
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
          style={[styles.input, secureTextEntry && styles.inputPassword]}
          placeholder={placeholder}
          placeholderTextColor="rgba(217, 185, 255, 0.3)"
          secureTextEntry={shouldSecure}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
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
    backgroundColor: 'rgba(20, 15, 30, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 255, 0.15)',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#d9b9ff',
    backgroundColor: 'rgba(20, 15, 30, 0.65)',
    shadowColor: '#d9b9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontStyle: 'italic', // To match the italic placeholder style
    fontSize: 14,
    color: '#ffffff',
    height: '100%',
  },
  inputPassword: {
    // Normal text when typing password is not italic, but wait, placeholder can be italic
    // We can keep it standard
  },
  rightIconContainer: {
    padding: 4,
    marginLeft: 8,
  },
});
