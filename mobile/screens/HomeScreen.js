import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  menuIcon: { position: 'absolute', top: 40, right: 20 },
  greeting: { marginTop: 80, fontSize: 28, color: '#000', lineHeight: 36 },
  calendarContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#333', borderRadius: 20, padding: 12, marginVertical: 20 },
  card: { backgroundColor: '#000', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 2, borderColor: '#5865F2' },
  cardTitle: { color: '#FFF', fontSize: 18, marginBottom: 12 },
  chartPlaceholder: { height: 120, backgroundColor: '#222', borderRadius: 10 },
  todoCard: { flex: 1, backgroundColor: '#000', borderRadius: 20, padding: 16, justifyContent: 'center' },
  todoTitle: { color: '#FFF', fontSize: 18, marginBottom: 8 },
  todoText: { color: '#888', fontSize: 14 },
  addButton: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#5865F2', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuIcon}>
        <Ionicons name="menu" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.greeting}>Olá,Nicole Ayla</Text>
      <View style={styles.calendarContainer}>
        {/* Aqui você pode implementar um componente de calendário */}
        <Text>04 dom - Maio 04,2025</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alguma coisa sobre o gráfico</Text>
        <View style={styles.chartPlaceholder}>
          {/* Exemplo de gráfico */}
        </View>
      </View>
      <View style={styles.todoCard}>
        <Text style={styles.todoTitle}>To do</Text>
        <Text style={styles.todoText}>Nenhuma tarefa para fazer no momento</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

