import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../components/Layout';
import { Linking } from 'react-native';


const { width, height } = Dimensions.get('window');

const ProdutosScreen = ({ navigation }) => {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const API_URL = 'http://10.136.23.106:3000';

  // Buscar produtos
  const buscarProdutos = async () => {
    try {
      console.log('Buscando produtos...');
      const response = await fetch(`${API_URL}/produto`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setProdutos(data.produto || []);
        setProdutosFiltrados(data.produto || []);
        console.log(`${data.produto?.length || 0} produtos carregados`);
      } else {
        console.error('Erro ao buscar produtos:', data.error);
        Alert.alert('Erro', data.error || 'Não foi possível carregar os produtos');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
  };

  // Buscar categorias
  const buscarCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.categorias) {
        const categoriasComTodas = [
          { categoria: 'todas', total_produto: produtos.length },
          ...data.categorias
        ];
        setCategorias(categoriasComTodas);
      } else {
        console.error('Erro ao buscar categorias:', data.error);
        setCategorias([{ categoria: 'todas', total_produto: produtos.length }]);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setCategorias([{ categoria: 'todas', total_produto: produtos.length }]);
    }
  };

  // Carregar dados iniciais
  const carregarDados = async () => {
    setLoading(true);
    await buscarProdutos();
    setLoading(false);
  };

  // Carregar categorias após carregar produtos
  useEffect(() => {
    if (produtos.length > 0) {
      buscarCategorias();
    }
  }, [produtos]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  }, []);

  // Filtrar produtos
  const filtrarProdutos = useCallback(() => {
    let resultado = produtos;

    if (categoriaSelecionada !== 'todas') {
      resultado = resultado.filter(produto => 
        produto.categoria === categoriaSelecionada
      );
    }

    if (searchText.trim()) {
      const textoBusca = searchText.toLowerCase().trim();
      resultado = resultado.filter(produto =>
        produto.nome?.toLowerCase().includes(textoBusca) ||
        produto.descricao?.toLowerCase().includes(textoBusca) ||
        produto.fornecedor?.toLowerCase().includes(textoBusca) ||
        produto.categoria?.toLowerCase().includes(textoBusca)
      );
    }

    setProdutosFiltrados(resultado);
  }, [produtos, categoriaSelecionada, searchText]);

  // Efeitos
  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [filtrarProdutos]);

  // Abrir detalhes do produto
  const abrirDetalhes = (produto) => {
    setProdutoSelecionado(produto);
    setModalVisible(true);
  };

  // Renderizar item da categoria
  const renderCategoria = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoriaButton,
        categoriaSelecionada === item.categoria && styles.categoriaSelecionada
      ]}
      onPress={() => setCategoriaSelecionada(item.categoria)}
    >
      <Text style={[
        styles.categoriaText,
        categoriaSelecionada === item.categoria && styles.categoriaTextSelecionada
      ]}>
        {item.categoria === 'todas' ? 'Todas' : item.categoria}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar item do produto
  const renderProduto = ({ item }) => (
    <TouchableOpacity
      style={styles.produtoCard}
      onPress={() => abrirDetalhes(item)}
      activeOpacity={0.9}
    >
      <View style={styles.produtoHeader}>
        <View style={styles.produtoTitleContainer}>
          <Text style={styles.produtoNome} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.produtoCategoria}>
            {item.categoria || 'Sem categoria'}
          </Text>
        </View>
        <View style={[
          styles.statusIndicator,
          item.estoqueStatus === 'baixo' ? styles.statusBaixo : styles.statusNormal
        ]} />
      </View>

      <View style={styles.produtoBody}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Estoque</Text>
          <Text style={[
            styles.infoValue,
            item.quantidade <= item.minimo && styles.infoValueAlert
          ]}>
            {item.quantidade}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Preço</Text>
          <Text style={styles.infoValue}>{item.precoFormatado}</Text>
        </View>
      </View>

      <View style={styles.produtoFooter}>
        <Text style={styles.produtoId}>#{item.id}</Text>
        <Icon name="arrow-forward" size={18} color="#6366f1" />
      </View>
    </TouchableOpacity>
  );

  // Modal de detalhes
  const ModalDetalhes = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Detalhes</Text>
              <Text style={styles.modalSubtitle}>Produto #{produtoSelecionado?.id}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {produtoSelecionado && (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>{produtoSelecionado.nome}</Text>
                
                {produtoSelecionado.descricao && (
                  <Text style={styles.detailDescription}>
                    {produtoSelecionado.descricao}
                  </Text>
                )}

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Categoria</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.categoria || 'Não informada'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Preço</Text>
                    <Text style={[styles.detailValue, styles.priceHighlight]}>
                      {produtoSelecionado.precoFormatado}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Estoque</Text>
                    <Text style={[
                      styles.detailValue,
                      produtoSelecionado.estoqueStatus === 'baixo' && styles.stockAlert
                    ]}>
                      {produtoSelecionado.quantidade} unidades
                    </Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Mínimo</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.minimo} unidades
                    </Text>
                  </View>
                </View>

               {produtoSelecionado.fornecedor && (
               <TouchableOpacity
              onPress={() => {
            const email = produtoSelecionado.fornecedor;
            const mailto = `mailto:${email}`;
            Linking.openURL(mailto).catch(err =>
            Alert.alert('Erro', 'Não foi possível abrir o app de e-mail.')
      );
    }}
    style={styles.detailSection}
  >
    <Text style={styles.detailLabel}>Fornecedor</Text>
    <Text style={[styles.detailValue, { color: '#1e1e2e', textDecorationLine: 'underline' }]}>
      {produtoSelecionado.fornecedor}
    </Text>
  </TouchableOpacity>
)}


                <View style={[
                  styles.statusCard,
                  produtoSelecionado.estoqueStatus === 'baixo' ? 
                    styles.statusCardAlert : styles.statusCardNormal
                ]}>
                  <View style={styles.statusHeader}>
                    <View style={[
                      styles.statusDot,
                      produtoSelecionado.estoqueStatus === 'baixo' ? 
                        styles.statusDotAlert : styles.statusDotNormal
                    ]} />
                    <Text style={[
                      styles.statusText,
                      produtoSelecionado.estoqueStatus === 'baixo' ? 
                        styles.statusTextAlert : styles.statusTextNormal
                    ]}>
                      {produtoSelecionado.estoqueStatus === 'baixo' ? 
                        'Estoque Baixo' : 'Estoque Normal'
                      }
                    </Text>
                  </View>
                  <Text style={styles.statusDescription}>
                    {produtoSelecionado.estoqueStatus === 'baixo' ? 
                      'Necessita reposição urgente' : 
                      'Quantidade adequada'
                    }
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <Layout>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Produtos</Text>
          <Text style={styles.subtitle}>
            {produtosFiltrados.length} item{produtosFiltrados.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#64748b"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      {categorias.length > 0 && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categorias}
            renderItem={renderCategoria}
            keyExtractor={(item) => item.categoria}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={produtosFiltrados}
        renderItem={renderProduto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Icon name="inventory-2" size={48} color="#475569" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {searchText || categoriaSelecionada !== 'todas' 
                ? 'Tente ajustar os filtros' 
                : 'Nenhum produto cadastrado'
              }
            </Text>
          </View>
        }
      />

      <ModalDetalhes />
    </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e1e2e',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafd',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e1e2e',
  },
  categoriesContainer: {
    backgroundColor: '#f8fafc',
    paddingBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 24,
  },
  categoriaButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  categoriaSelecionada: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoriaText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoriaTextSelecionada: {
    color: '#1e1e2e',
  },
  productsList: {
    padding: 24,
  },
  produtoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2d44',
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  produtoTitleContainer: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e1e2e',
    marginBottom: 4,
  },
  produtoCategoria: {
    fontSize: 13,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusBaixo: {
    backgroundColor: '#ef4444',
  },
  statusNormal: {
    backgroundColor: '#10b981',
  },
  produtoBody: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
    marginRight: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e1e2e',
    fontWeight: '600',
  },
  infoValueAlert: {
    color: '#ef4444',
  },
  produtoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  produtoId: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1e2e',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafb',
  },
  modalBody: {
    padding: 24,
  },
  detailCard: {
    backgroundColor: '#f8fafb',
    borderRadius: 20,
    padding: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e1e2e',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  detailItem: {
    width: '50%',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e1e2e',
    fontWeight: '600',
  },
  priceHighlight: {
    color: '#6366f1',
    fontSize: 18,
  },
  stockAlert: {
    color: '#ef4444',
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statusCardAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusCardNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotAlert: {
    backgroundColor: '#ef4444',
  },
  statusDotNormal: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusTextAlert: {
    color: '#ef4444',
  },
  statusTextNormal: {
    color: '#10b981',
  },
  statusDescription: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ProdutosScreen;