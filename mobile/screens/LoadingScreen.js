// screens/LoadingScreen.js
import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', justifyContent: 'center', alignItems: 'center' },
  image: { width: 150, height: 150, resizeMode: 'contain' },
});
