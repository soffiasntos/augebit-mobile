import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
     useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Group 5.png')} style={styles.logo} />
      <Image source={require('../assets/Group 6.png')} style={styles.nome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 2, backgroundColor: '#0F0F0F', justifyContent: 'space-around', alignItems: 'flex-start' },
  logo: { width: 420, height: 420, resizeMode: 'contain', marginTop: 100},
  nome: { marginLeft: 33,
  }
});
