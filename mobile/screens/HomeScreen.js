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
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../components/Layout';
import { useFonts } from 'expo-font';

export default function HomeScreen() {
  const [nomeUsuario, setNomeUsuario] = useState('Nicole Ayla');
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
  const [estatisticasRequisicoes, setEstatisticasRequisicoes] = useState([]);
  const [loadingRequisicoes, setLoadingRequisicoes] = useState(true);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/PoppinsRegular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    carregarNome();
    atualizarData();
    carregarTodos();
    buscarEstatisticasRequisicoes();
  }, []);

  const carregarNome = async () => {
    try {
      const userData = await AsyncStorage.getItem('usuarioLogado');
      if (userData) {
        const usuario = JSON.parse(userData);
        const nome = usuario.nome || usuario.Nome || usuario.NOME || 'Nicole Ayla';
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

  const buscarEstatisticasRequisicoes = async () => {
    setLoadingRequisicoes(true);
    try {
      const response = await fetch('http://10.136.23.237:3000/requisicoes/estatisticas');
      const data = await response.json();
      if (data.success) {
        setEstatisticasRequisicoes(data.estatisticas);
      } else {
        console.log('Resposta sem sucesso:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados das requisições');
    } finally {
      setLoadingRequisicoes(false);
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

  const formatarMes = (mesAno) => {
    if (!mesAno) return '';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const [ano, mes] = mesAno.split('-');
    return meses[parseInt(mes) - 1];
  };

  const calcularAlturasGrafico = () => {
    if (!estatisticasRequisicoes.length) return [];
    
    const maxTotal = Math.max(...estatisticasRequisicoes.map(item => item.total));
    
    return estatisticasRequisicoes.map(item => ({
      mes: formatarMes(item.mes),
      total: item.total,
      atendidas: item.atendidas,
      pendentes: item.pendentes,
      atrasadas: item.atrasadas,
      alturaTotal: Math.round((item.total / maxTotal) * 120),
      alturaAtendidas: Math.round((item.atendidas / maxTotal) * 120)
    }));
  };

  const dadosGrafico = calcularAlturasGrafico();

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => toggleTarefa(item.id)}
      >
        <View style={styles.todoCheckbox}>
          {item.concluida && (
            <Ionicons name="checkmark" size={16} color="#6366F1" />
          )}
        </View>
        <Text style={[
          styles.todoText, 
          item.concluida && styles.todoTextCompleted
        ]}>
          {item.texto}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => removerTarefa(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
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

        {/* Chart Card - Requisições de Materiais */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Requisições de materiais{'\n'}
            <Text style={styles.chartTitleHighlight}>últimos 6 meses</Text>
          </Text>
          
        {loadingRequisicoes ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="small" color="#6366F1" />
    <Text style={styles.loadingText}>Carregando dados...</Text>
  </View>
) : dadosGrafico.length > 0 ? (
  <>
    {/* ... resto do código do gráfico ... */}
    
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryText}>
        Total de requisições: {estatisticasRequisicoes.reduce((sum, item) => sum + item.total, 0)}
      </Text>
     <Text style={styles.summaryText}>
  Taxa de atendimento: {
    estatisticasRequisicoes.reduce((sum, item) => sum + item.total, 0) > 0
      ? Math.round(
          (estatisticasRequisicoes.reduce((sum, item) => sum + item.atendidas, 0) /
            estatisticasRequisicoes.reduce((sum, item) => sum + item.total, 0)) * 100
        ) + '%' 
      : '0%'
  }
</Text>

    </View>
  </>
) : (
  <Text style={styles.emptyText}>Nenhum dado disponível</Text>
)}
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
              <Ionicons name="add" size={20} color="#000" />
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
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10
  },
  greeting: {
    fontSize: 27,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 25,
    lineHeight: 38,
    paddingTop: 20
  },
  calendarCard: {
    backgroundColor: '#374151',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins-medium'
  },
  calendarDate: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular'
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 42
  },
  todayContainer: {
    backgroundColor: '#6366F1'
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4
  },
  todayNumber: {
    color: '#FFFFFF'
  },
  dayName: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
  todayName: {
    color: '#FFFFFF'
  },
  chartCard: {
    backgroundColor: '#0A0A0D',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginBottom: 30,
    lineHeight: 24
  },
  chartTitleHighlight: {
    color: '#6366F1',
    fontFamily: 'Poppins-SemiBold'
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 10
  },
  chartBar: {
    alignItems: 'center',
    flex: 1
  },
  barBackground: {
    width: 32,
    backgroundColor: 'transparent',
    borderRadius: 6,
    marginBottom: 12,
    height: '100%',
    justifyContent: 'flex-end'
  },
  barTotal: {
    width: '100%',
    backgroundColor: '#4B5563',
    borderRadius: 6,
    position: 'absolute',
    bottom: 0
  },
  barAtendidas: {
    width: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 6,
    position: 'absolute',
    bottom: 0
  },
  barLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4
  },
  barMonth: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontFamily: 'Poppins-Regular'
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    height: 140,
    textAlignVertical: 'center',
    fontFamily: 'Poppins-Regular'
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
  summaryContainer: {
    marginTop: 20,
    paddingHorizontal: 10
  },
  summaryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 8
  },
  todoCard: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    minHeight: 120
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  todoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  todoIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#6366F1',
    borderRadius: 2,
    marginRight: 12
  },
  todoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold'
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTodoText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20
  },
  todoList: {
    flex: 1
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937'
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  todoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    flex: 1
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280'
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalButtonAdd: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  modalButtonTextCancel: {
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold'
  },
  modalButtonTextAdd: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold'
  }
});