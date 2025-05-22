import React, { useState } from 'react';
<<<<<<< HEAD
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://10.136.23.237:3000/api';

  const handleLogin = async () => {
    if (!email || !senha) {
      setError('Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/login`, { email, senha });

      if (response.data.success) {
        setError(null);
        navigation.replace('Home'); // ou 'Loading' se for o nome da próxima tela
      } else {
        setError('Email ou senha inválidos.');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err.message);
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Bem-vindo(a) de volta!</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
=======
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
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1E1D25',
    color: '#fff',
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 10,
  },
});
=======
  container: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'space-around' },
  title: { color: '#FFF', fontSize: 37, lineHeight: 40, marginTop: 60, fontWeight: 'bold'},
  input: { backgroundColor: '#1E1D25', color: '#FFF', borderRadius: 35, height: 70, paddingHorizontal: 20, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FFF', height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginTop: 50},
  buttonText: { color: '#000', fontSize: 20, fontWeight: 'bold' },
  nome: { marginLeft: 10,},
  form: {height: 150, marginBottom: 80}
});
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
