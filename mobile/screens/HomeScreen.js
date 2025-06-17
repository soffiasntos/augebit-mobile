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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../components/Layout';
import { useFonts } from 'expo-font';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function SuppliesDashboard() {
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
  const [activeTab, setActiveTab] = useState('Todas');
  
  // Estados específicos para o dashboard de suprimentos
  const [metricas, setMetricas] = useState({
    pedidosPendentes: 12,
    estoqueMinimo: 5,
    fornecedoresAtivos: 8,
    valorMensal: 45800,
    economiaGerada: 8500,
    eficienciaProcessos: 87
  });

  const [alertasSuprimentos, setAlertasSuprimentos] = useState([
    { id: 1, item: 'Papel A4', nivel: 'baixo', categoria: 'Material de Escritório', quantidade: 15 },
    { id: 2, item: 'Tinta para Impressora HP', nivel: 'crítico', categoria: 'Suprimentos TI', quantidade: 3 },
    { id: 3, item: 'Cabos HDMI', nivel: 'baixo', categoria: 'Equipamentos', quantidade: 8 },
    { id: 4, item: 'Grampeador', nivel: 'crítico', categoria: 'Material de Escritório', quantidade: 2 }
  ]);

  // Dados para gráficos
  const [gastosMensais] = useState({
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      data: [38500, 42300, 45800, 41200, 47600, 45800],
      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
      strokeWidth: 3
    }]
  });

  const [categoriaGastos] = useState([
    { name: 'TI', population: 35, color: '#6366F1', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Escritório', population: 28, color: '#10B981', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Limpeza', population: 20, color: '#F59E0B', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Outros', population: 17, color: '#EF4444', legendFontColor: '#374151', legendFontSize: 12 }
  ]);

  const [fornecedoresPerformance] = useState({
    labels: ['Fornec. A', 'Fornec. B', 'Fornec. C', 'Fornec. D'],
    datasets: [{
      data: [95, 87, 78, 92]
    }]
  });

  const [progressoMetas] = useState({
    labels: ['Economia', 'Qualidade', 'Prazo', 'Satisfação'],
    data: [0.87, 0.94, 0.78, 0.91]
  });

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/PoppinsRegular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForLabels: {
      fontFamily: 'Poppins-Regular'
    }
  };

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
    <View style={styles.todoItem}>
      <TouchableOpacity 
        style={styles.todoContent}
        onPress={() => toggleTarefa(item.id)}
      >
        <View style={[
          styles.todoCheckbox,
          item.concluida && styles.todoCheckboxCompleted
        ]}>
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
        <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const renderAlertaItem = ({ item }) => (
    <View style={styles.alertaItem}>
      <View style={styles.alertaContent}>
        <View style={[
          styles.alertaIndicator,
          item.nivel === 'crítico' ? styles.alertaCritico : styles.alertaBaixo
        ]} />
        <View style={styles.alertaInfo}>
          <Text style={styles.alertaItemNome}>{item.item}</Text>
          <Text style={styles.alertaCategoria}>{item.categoria}</Text>
          <Text style={styles.alertaQuantidade}>Qtd: {item.quantidade}</Text>
        </View>
      </View>
      <View style={[
        styles.alertaNivel,
        item.nivel === 'crítico' ? styles.nivelCritico : styles.nivelBaixo
      ]}>
        <Text style={[
          styles.alertaNivelText,
          item.nivel === 'crítico' ? styles.nivelCriticoText : styles.nivelBaixoText
        ]}>
          {item.nivel.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Header com saudação personalizada para suprimentos */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>Olá, {nomeUsuario},</Text>
          <Text style={styles.greetingSecond}>
            <Text style={styles.bemVinda}>bem-vinda </Text>
            <Text style={styles.deVolta}>de volta!</Text>
          </Text>
          <Text style={styles.departamento}>Departamento de suprimentos</Text>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Hoje</Text>
            <Text style={styles.calendarDate}>
              {dataAtual.mes} {'\n'}{dataAtual.dia ? dataAtual.dia.toString().padStart(2, '0') : '01'}, {dataAtual.ano}
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

        {/* Motivational Message */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalTitle}>Dê uma olhada!</Text>
          <Text style={styles.motivationalSubtitle}>Acompanhe a estatística da Augebit!</Text>
        </View>

        {/* Gráfico de Gastos Mensais */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Evolução de Gastos (6 meses)</Text>
            <View style={styles.chartBadge}>
              <Text style={styles.chartBadgeText}>+5.2%</Text>
            </View>
          </View>
          <LineChart
            data={gastosMensais}
            width={screenWidth - 60}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            segments={4}
          />
        </View>

        {/* Dashboard Overview */}
        <View style={styles.dashboardOverviewContainer}>
          <Text style={styles.dashboardTitle}>Dashboard overview</Text>
          
          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            {['Todas', 'Cronograma', 'Pendências'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.activeTabButtonText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dashboard Cards */}
          <View style={styles.dashboardCardsContainer}>
            {/* Cronograma Card */}
            <TouchableOpacity style={styles.cronogramaCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Cronograma</Text>
                <View style={styles.cardIcon}>
                  <Ionicons name="arrow-forward-outline" size={20} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.cardNumber}>57</Text>
              <Text style={styles.cardSubtitle}>Eventos</Text>
            </TouchableOpacity>

            {/* Bottom Row Cards */}
            <View style={styles.bottomCardsRow}>
              {/* Pendências Card */}
              <TouchableOpacity style={styles.pendenciasCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitleSmall}>Pendências</Text>
                  <View style={styles.cardIconSmall}>
                    <Ionicons name="arrow-forward-outline" size={16} color="#4C1D95" />
                  </View>
                </View>
                <Text style={styles.cardNumberSmall}>86</Text>
                <Text style={styles.cardSubtitleSmall}>Pedidos incompletos</Text>
              </TouchableOpacity>

              {/* Fornecedores Card */}
              <TouchableOpacity style={styles.fornecedoresCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitleSmall}>Fornecedores</Text>
                  <View style={styles.cardIconSmall}>
                    <Ionicons name="arrow-forward-outline" size={16} color="#6B7280" />
                  </View>
                </View>
                <Text style={styles.cardNumberSmall}>34</Text>
                <Text style={styles.cardSubtitleSmall}>Fornecedores ativos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Todo Card */}
        <View style={styles.todoCard}>
          <View style={styles.todoHeader}>
            <Text style={styles.todoTitle}>To do</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {todos.length === 0 ? (
            <View style={styles.emptyTodoContainer}>
              <Text style={styles.emptyTodoText}>
                Nenhuma tarefa para fazer no momento
              </Text>
            </View>
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
            <Text style={styles.modalTitle}>Nova Tarefa de Suprimentos</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Solicitar cotação para papel A4..."
              placeholderTextColor="#888"
              value={novaTarefa}
              onChangeText={setNovaTarefa}
              multiline
              maxLength={100}
              autoFocus
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
    backgroundColor: '#F8FAFC',
    paddingTop: 10
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 25
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 0
  },
  greetingSecond: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 8
  },
  bemVinda: {
    color: '#1F2937'
  },
  deVolta: {
    color: '#6366F1'
  },
  departamento: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 4
  },
  calendarCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium'
  },
  calendarDate: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    lineHeight: 16
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 38,
    flex: 1,
    marginHorizontal: 2
  },
  todayContainer: {
    backgroundColor: '#6366F1'
  },
  dayNumber: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4
  },
  todayNumber: {
    color: '#FFFFFF'
  },
  dayName: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: 'Poppins-Regular'
  },
  todayName: {
    color: '#FFFFFF'
  },
  motivationalCard: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  motivationalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 4
  },
  motivationalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280'
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
    flex: 1
  },
  chartBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  chartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  dashboardOverviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  dashboardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 16
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeTabButton: {
    backgroundColor: '#1F2937'
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280'
  },
  activeTabButtonText: {
    color: '#FFFFFF'
  },
  dashboardCardsContainer: {
    gap: 12
  },
  cronogramaCard: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF'
  },
  cardTitleSmall: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4C1D95'
  },
  cardIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardIconSmall: {
    backgroundColor: 'rgba(76, 29, 149, 0.1)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardNumber: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  cardNumberSmall: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)'
  },
  cardSubtitleSmall: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280'
  },
  bottomCardsRow: {
    flexDirection: 'row',
    gap: 12
  },
  pendenciasCard: {
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    flex: 1
  },
  fornecedoresCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    flex: 1
  },
  todoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  todoTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold'
  },
  addButton: {
    backgroundColor: '#000000',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTodoContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyTodoText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center'
  },
  todoList: {
    flex: 1
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
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
  todoCheckboxCompleted: {
    backgroundColor: '#6366F1'
  },
  todoText: {
    color: '#1F2937',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    flex: 1
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF'
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalButtonAdd: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalButtonTextCancel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280'
  },
  modalButtonTextAdd: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF'
  },

  // Alertas de Suprimentos Styles
  alertasContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  alertasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  alertasTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937'
  },
  alertaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8
  },
  alertaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  alertaIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12
  },
  alertaCritico: {
    backgroundColor: '#EF4444'
  },
  alertaBaixo: {
    backgroundColor: '#F59E0B'
  },
  alertaInfo: {
    flex: 1
  },
  alertaItemNome: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937',
    marginBottom: 2
  },
  alertaCategoria: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 2
  },
  alertaQuantidade: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF'
  },
  alertaNivel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  nivelCritico: {
    backgroundColor: '#FEE2E2'
  },
  nivelBaixo: {
    backgroundColor: '#FEF3C7'
  },
  alertaNivelText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold'
  },
  nivelCriticoText: {
    color: '#DC2626'
  },
  nivelBaixoText: {
    color: '#D97706'
  },

  // Métricas Cards Styles
  metricasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12
  },
  metricaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  metricaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  metricaValor: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 4
  },
  metricaLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 16
  },
  metricaVariacao: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginTop: 4
  },
  variacaoPositiva: {
    color: '#10B981'
  },
  variacaoNegativa: {
    color: '#EF4444'
  },

  // Additional Chart Styles
  pieChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  pieChartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  
  // Performance Chart Styles
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  performanceTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 16
  },

  // Progress Chart Styles
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 16
  },

  // Quick Actions Styles
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  quickActionsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
    marginBottom: 16
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937',
    textAlign: 'center'
  },

  // Summary Stats Styles
  summaryStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12
  },
  summaryStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  summaryStatNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 4
  },
  summaryStatLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center'
  },
  summaryStatTrend: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginTop: 4
  },

  // Responsive adjustments
  '@media (max-width: 375)': {
    greeting: {
      fontSize: 22
    },
    greetingSecond: {
      fontSize: 22
    },
    cardNumber: {
      fontSize: 28
    },
    cardNumberSmall: {
      fontSize: 20
    }
  }
});