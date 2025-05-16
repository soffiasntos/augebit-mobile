import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleLogin = async () => {
  try {
    const response = await fetch('http://10.136.23.237:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha: password }), // envia os dados
    });

    const data = await response.json();

    if (data.success) {
      navigation.replace('Loading'); // login bem-sucedido
    } else {
      alert('Email ou senha inválidos');
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    alert('Erro ao conectar com o servidor.');
  }
   navigation.replace('Loading');
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
     

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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

