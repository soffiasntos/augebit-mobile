import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // realizar validação aqui
    navigation.replace('Loading');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá,{"\n"}Bem Vindo{"\n"}de Volta</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 32, lineHeight: 40, marginBottom: 40 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 25, height: 50, paddingHorizontal: 20, marginBottom: 16 },
  button: { backgroundColor: '#FFF', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

