import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
    
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Substitua IP_DO_SEU_COMPUTADOR pelo IP da sua máquina na rede local
      // por exemplo: 192.168.1.5
      const response = await fetch('http://192.168.1.112:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Login bem-sucedido
        navigation.replace('Loading');
      } else {
        // Login falhou
        Alert.alert('Erro', data.message || 'Email ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando e acessível.');
    } finally {
      setIsLoading(false);
    }
  };
    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá,{"\n"}Bem Vindo(a){"\n"}de Volta</Text>
      <View style={styles.form}>
        <View>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>
            
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Carregando...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
            
      <Image source={require('../assets/Group 6.png')} style={styles.nome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'space-around' },
  title: { color: '#FFF', fontSize: 37, lineHeight: 40, marginTop: 60, fontWeight: 'bold'},
  input: { backgroundColor: '#1E1D25', color: '#FFF', borderRadius: 35, height: 70, paddingHorizontal: 20, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FFF', height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginTop: 50},
  buttonText: { color: '#000', fontSize: 20, fontWeight: 'bold' },
  nome: { marginLeft: 10,},
  form: {height: 150, marginBottom: 80}
});