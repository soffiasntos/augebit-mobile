// screens/ProdutosScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from '../components/Layout'; // ajuste o caminho conforme seu projeto

export default function ProdutosScreen() {
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Controle de Produtos</Text>
        {/* Aqui você pode adicionar a lógica de exibição de produtos futuramente */}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
