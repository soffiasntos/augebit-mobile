import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  ScrollView,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [dataAtual, setDataAtual] = useState({
    dia: 1,
    diaSemana: 'dom',
    mes: 'Janeiro',
    ano: 2025
  });
  const [diasSemana, setDiasSemana] = useState([]);
  const [todos, setTodos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState('');

  useEffect(() => {
    carregarNome();
    atualizarData();
    carregarTodos();
  }, []);

  const carregarNome = async () => {
    try {
      const userData = await AsyncStorage.getItem('usuarioLogado');
      if (userData) {
        const usuario = JSON.parse(userData);
        const nome = usuario.nome || usuario.Nome || usuario.NOME || 'Usuário';
        setNomeUsuario(nome);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const atualizarData = () => {
    try {
      const hoje = new Date();
      const diasDaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const diaAtual = hoje.getDate();
      const diaSemanaAtual = hoje.getDay();
      const mesAtual = meses[hoje.getMonth()];
      const anoAtual = hoje.getFullYear();

      setDataAtual({
        dia: diaAtual,
        diaSemana: diasDaSemana[diaSemanaAtual],
        mes: mesAtual,
        ano: anoAtual
      });

      // Gerar os 7 dias da semana centrados no dia atual
      const semana = [];
      for (let i = -3; i <= 3; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + i);
        semana.push({
          dia: data.getDate().toString().padStart(2, '0'),
          diaSemana: diasDaSemana[data.getDay()],
          isToday: i === 0
        });
      }
      setDiasSemana(semana);
    } catch (error) {
      console.error('Erro ao atualizar data:', error);
      // Valores padrão em caso de erro
      setDataAtual({
        dia: 1,
        diaSemana: 'dom',
        mes: 'Janeiro',
        ano: 2025
      });
      setDiasSemana([]);
    }
  };

  const carregarTodos = async () => {
    try {
      const todosData = await AsyncStorage.getItem('todos');
      if (todosData) {
        setTodos(JSON.parse(todosData));
      }
    } catch (error) {
      console.error('Erro ao carregar todos:', error);
    }
  };

  const salvarTodos = async (novosTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(novosTodos));
    } catch (error) {
      console.error('Erro ao salvar todos:', error);
    }
  };

  const adicionarTarefa = () => {
    if (novaTarefa.trim()) {
      const novaTarefaObj = {
        id: Date.now().toString(),
        texto: novaTarefa.trim(),
        concluida: false
      };
      
      const novosTodos = [...todos, novaTarefaObj];
      setTodos(novosTodos);
      salvarTodos(novosTodos);
      setNovaTarefa('');
      setModalVisible(false);
    } else {
      Alert.alert('Erro', 'Digite uma tarefa válida');
    }
  };

  const toggleTarefa = (id) => {
    const novosTodos = todos.map(todo =>
      todo.id === id ? { ...todo, concluida: !todo.concluida } : todo
    );
    setTodos(novosTodos);
    salvarTodos(novosTodos);
  };

  const removerTarefa = (id) => {
    Alert.alert(
      'Remover Tarefa',
      'Tem certeza que deseja remover esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            const novosTodos = todos.filter(todo => todo.id !== id);
            setTodos(novosTodos);
            salvarTodos(novosTodos);
          }
        }
      ]
    );
  };

  const renderTodoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.todoItem} 
      onPress={() => toggleTarefa(item.id)}
      onLongPress={() => removerTarefa(item.id)}
    >
      <View style={styles.todoCheckbox}>
        {item.concluida && (
          <Ionicons name="checkmark" size={16} color="#5865F2" />
        )}
      </View>
      <Text style={[
        styles.todoText, 
        item.concluida && styles.todoTextCompleted
      ]}>
        {item.texto}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>AUGEBIT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greeting}>Olá,{'\n'}{nomeUsuario}</Text>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Hoje</Text>
            <Text style={styles.calendarDate}>
              {dataAtual.mes} {dataAtual.dia ? dataAtual.dia.toString().padStart(2, '0') : '01'},{dataAtual.ano}
            </Text>
          </View>
          
          <View style={styles.weekContainer}>
            {diasSemana.map((dia, index) => (
              <View 
                key={index} 
                style={[
                  styles.dayContainer, 
                  dia.isToday && styles.todayContainer
                ]}
              >
                <Text style={[
                  styles.dayNumber, 
                  dia.isToday && styles.todayNumber
                ]}>
                  {dia.dia}
                </Text>
                <Text style={[
                  styles.dayName, 
                  dia.isToday && styles.todayName
                ]}>
                  {dia.diaSemana}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Alguma coisa sobre{'\n'}o <Text style={styles.chartTitleHighlight}>gráfico</Text></Text>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartBar}>
              <View style={[styles.bar, { height: 40 }]} />
              <Text style={styles.barLabel}>24%</Text>
              <Text style={styles.barMonth}>Jan</Text>
            </View>
            <View style={styles.chartBar}>
              <View style={[styles.bar, { height: 80 }]} />
              <Text style={styles.barLabel}>56%</Text>
              <Text style={styles.barMonth}>Fev</Text>
            </View>
            <View style={styles.chartBar}>
              <View style={[styles.bar, { height: 50 }]} />
              <Text style={styles.barLabel}>31%</Text>
              <Text style={styles.barMonth}>Mar</Text>
            </View>
            <View style={styles.chartBar}>
              <View style={[styles.bar, { height: 100 }]} />
              <Text style={styles.barLabel}>75%</Text>
              <Text style={styles.barMonth}>Abr</Text>
            </View>
          </View>
        </View>

        {/* Todo Card */}
        <View style={styles.todoCard}>
          <View style={styles.todoHeader}>
            <View style={styles.todoTitleContainer}>
              <View style={styles.todoIndicator} />
              <Text style={styles.todoTitle}>To do</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {todos.length === 0 ? (
            <Text style={styles.emptyTodoText}>
              Nenhuma tarefa para fazer no momento
            </Text>
          ) : (
            <FlatList
              data={todos}
              renderItem={renderTodoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={styles.todoList}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal para adicionar tarefa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Digite sua tarefa..."
              placeholderTextColor="#888"
              value={novaTarefa}
              onChangeText={setNovaTarefa}
              multiline
              maxLength={100}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => {
                  setModalVisible(false);
                  setNovaTarefa('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonAdd}
                onPress={adicionarTarefa}
              >
                <Text style={styles.modalButtonTextAdd}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15
  },
  iconButton: {
    padding: 5
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 30,
    lineHeight: 40
  },
  calendarCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  calendarTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  calendarDate: {
    color: '#999',
    fontSize: 14
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dayContainer: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 15,
    minWidth: 40
  },
  todayContainer: {
    backgroundColor: '#5865F2'
  },
  dayNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  todayNumber: {
    color: '#FFF'
  },
  dayName: {
    color: '#999',
    fontSize: 12
  },
  todayName: {
    color: '#FFF'
  },
  chartCard: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  chartTitleHighlight: {
    color: '#5865F2'
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120
  },
  chartBar: {
    alignItems: 'center'
  },
  bar: {
    width: 30,
    backgroundColor: '#444',
    borderRadius: 4,
    marginBottom: 8
  },
  barLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  barMonth: {
    color: '#888',
    fontSize: 12
  },
  todoCard: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    minHeight: 150
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  todoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  todoIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#5865F2',
    borderRadius: 2,
    marginRight: 10
  },
  todoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTodoText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'left'
  },
  todoList: {
    flex: 1
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#5865F2',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  todoText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalButtonAdd: {
    flex: 1,
    backgroundColor: '#5865F2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: 'bold'
  },
  modalButtonTextAdd: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});