import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://10.136.23.106:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      console.log('Tentando fazer login com:', { email: email.trim() });
      
      const response = await api.post('/login', {
        email: email.trim(),
        senha: password.trim()
      });

      console.log('Resposta do servidor:', response.data);

      if (response.data.success) {
        const user = response.data.user;
        
        console.log('Dados do usuário recebidos:', user);

        // Salva usuário localmente (sem a senha)
        await AsyncStorage.setItem('usuarioLogado', JSON.stringify(user));
        
        console.log('Usuário salvo no AsyncStorage');

        Alert.alert('Sucesso', `Bem-vindo, ${user.nome || user.Nome}!`);
        navigation.replace('Home', { user });
      } else {
        Alert.alert('Erro', 'Email ou senha inválidos');
      }
    } catch (error) {
      console.error('Erro completo:', error);
      
      if (error.response && error.response.status === 401) {
        Alert.alert('Erro', 'Email ou senha inválidos');
      } else {
        let errorMessage = 'Erro de conexão desconhecido';

        if (error.response) {
          errorMessage = error.response.data.message || 'Erro no servidor';
          console.log('Erro da resposta:', error.response.data);
        } else if (error.request) {
          errorMessage = 'Servidor não respondeu. Verifique se o servidor está rodando e se você está na mesma rede Wi-Fi.';
        } else {
          errorMessage = error.message;
        }

        Alert.alert('Erro de conexão', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá,{"\n"}Bem Vindo(a){"\n"}de Volta</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />

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
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'space-around'
  },
  title: {
    color: '#FFF',
    fontSize: 37,
    lineHeight: 40,
    marginTop: 60,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#1E1D25',
    color: '#FFF',
    borderRadius: 35,
    height: 70,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 16
  },
  button: {
    backgroundColor: '#FFF',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold'
  },
  nome: {
    marginLeft: 10
  },
  form: {
    height: 200,
    marginBottom: 80
  }
});