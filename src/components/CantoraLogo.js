import React from 'react';
import { View, Image } from 'react-native';

export default function CantoraLogo({ size = 120 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}
