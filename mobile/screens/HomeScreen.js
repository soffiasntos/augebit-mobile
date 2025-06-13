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
          <Text style={styles.greeting}>Olá,{'\n'}{nomeUsuario}</Text>
          <Text style={styles.departamento}>Departamento de Suprimentos</Text>
          <Text style={styles.empresa}>TechDesign Solutions</Text>
        </View>

        {/* Cards de Métricas Principais */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={[styles.metricCard, styles.metricCardPrimary]}>
              <Ionicons name="clipboard-outline" size={24} color="#6366F1" />
              <Text style={styles.metricNumber}>{metricas.pedidosPendentes}</Text>
              <Text style={styles.metricLabel}>Pedidos{'\n'}Pendentes</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardWarning]}>
              <Ionicons name="warning-outline" size={24} color="#F59E0B" />
              <Text style={styles.metricNumber}>{metricas.estoqueMinimo}</Text>
              <Text style={styles.metricLabel}>Itens Estoque{'\n'}Mínimo</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Ionicons name="people-outline" size={24} color="#10B981" />
              <Text style={styles.metricNumber}>{metricas.fornecedoresAtivos}</Text>
              <Text style={styles.metricLabel}>Fornecedores{'\n'}Ativos</Text>
            </View>
            <View style={[styles.metricCard, styles.metricCardInfo]}>
              <Ionicons name="card-outline" size={24} color="#3B82F6" />
              <Text style={styles.metricNumber}>R$ {(metricas.valorMensal / 1000).toFixed(0)}K</Text>
              <Text style={styles.metricLabel}>Gasto{'\n'}Mensal</Text>
            </View>
          </View>
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

        {/* Gráfico de Categorias de Gastos */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribuição por Categoria</Text>
          <PieChart
            data={categoriaGastos}
            width={screenWidth - 60}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* Progresso das Metas */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Progresso das Metas 2025</Text>
          <ProgressChart
            data={progressoMetas}
            width={screenWidth - 60}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];
                return colors[index % colors.length];
              }
            }}
            hideLegend={false}
            style={styles.chart}
          />
        </View>

        {/* Performance dos Fornecedores */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Performance dos Fornecedores (%)</Text>
          <BarChart
            data={fornecedoresPerformance}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.7,
              fillShadowGradient: '#6366F1',
              fillShadowGradientOpacity: 1,
            }}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        </View>

        {/* Alertas de Estoque */}
        <View style={styles.alertasCard}>
          <View style={styles.alertasHeader}>
            <View style={styles.alertasTitleContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
              <Text style={styles.alertasTitle}>Alertas de Estoque</Text>
            </View>
            <View style={styles.alertasBadge}>
              <Text style={styles.alertasBadgeText}>{alertasSuprimentos.length}</Text>
            </View>
          </View>

          <FlatList
            data={alertasSuprimentos}
            renderItem={renderAlertaItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            style={styles.alertasList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Cronograma</Text>
            <Text style={styles.calendarDate}>
              {dataAtual.mes} {dataAtual.dia ? dataAtual.dia.toString().padStart(2, '0') : '01'}, {dataAtual.ano}
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

        {/* Todo Card */}
        <View style={styles.todoCard}>
          <View style={styles.todoHeader}>
            <View style={styles.todoTitleContainer}>
              <View style={styles.todoIndicator} />
              <Text style={styles.todoTitle}>Tarefas de Suprimentos</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {todos.length === 0 ? (
            <View style={styles.emptyTodoContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#4B5563" />
              <Text style={styles.emptyTodoText}>
                Nenhuma tarefa pendente no momento
              </Text>
              <Text style={styles.emptyTodoSubtext}>
                Toque no + para adicionar uma nova tarefa
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
    fontSize: 27,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937',
    lineHeight: 38,
    marginBottom: 8
  },
  departamento: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6366F1',
    marginBottom: 4
  },
  empresa: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280'
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  metricCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1'
  },
  metricCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B'
  },
  metricCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981'
  },
  metricCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6'
  },
  metricNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
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
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F2937',
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
    fontFamily: 'Poppins-Medium'
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
  alertasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 20
  },
  alertasTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  alertasTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 12
  },
  alertasBadge: {
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertasBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold'
  },
  alertasList: {
    flex: 1
  },
  alertaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
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
    color: '#1F2937',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2
  },
  alertaCategoria: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginBottom: 2
  },
  alertaQuantidade: {
    color: '#374151',
    fontSize: 11,
    fontFamily: 'Poppins-Regular'
  },
  alertaNivel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  nivelCritico: {
    backgroundColor: '#FEE2E2'
  },
  nivelBaixo: {
    backgroundColor: '#FEF3C7'
  },
  alertaNivelText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold'
  },
  nivelCriticoText: {
    color: '#DC2626'
  },
  nivelBaixoText: {
    color: '#D97706'
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
  emptyTodoContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyTodoText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4
  },
  emptyTodoSubtext: {
    color: '#4B5563',
    fontSize: 12,
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
  todoCheckboxCompleted: {
    backgroundColor: '#6366F1'
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
    textAlign: 'center',
    color: '#1F2937'
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
    marginBottom: 20,
    color: '#1F2937'
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

