import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { Video } from 'expo-av'; // Voltando para expo-av

const { width } = Dimensions.get('window');

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home'); // Substitua por sua tela final
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onde a eficiência{"\n"}encontra a{"\n"}inovação.</Text>
      <Video
        source={require('../assets/loading.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        isLooping
        style={styles.video}
      />
      <Image source={require('../assets/Group 6.png')} style={styles.nome} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  video: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
    marginLeft: 50
  },
  nome: { 
    marginLeft: 30, 
    marginBottom: 50
  },
  title: { 
    color: '#FFF', 
    fontSize: 33, 
    lineHeight: 40, 
    marginTop: 80, 
    fontWeight: 'medium', 
    marginLeft: 30,
  },
});