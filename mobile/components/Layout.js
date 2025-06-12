import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from './config'; // Ajuste o caminho conforme necessário

// Importe suas imagens aqui
import menuIcon from '../assets/Home/menu.png';
import nomeW from '../assets/Home/NomeBranco.png';
import NomeLogo from '../assets/Home/NomeLogo.png';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

export default function Layout({ children, showHeader = true }) {
  const navigation = useNavigation();
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertasVisible, setAlertasVisible] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Estado para produtos com estoque baixo
  const [alertasSuprimentos, setAlertasSuprimentos] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(false);

  useEffect(() => {
    carregarNome();
    buscarProdutosEstoqueBaixo();
    
    // Atualizar alertas a cada 5 minutos
    const interval = setInterval(() => {
      buscarProdutosEstoqueBaixo();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const carregarNome = async () => {
    try {
      const userData = await AsyncStorage.getItem('usuarioLogado');
      if (userData) {
        const usuario = JSON.parse(userData);
        const nome = usuario.nome || usuario.Nome || usuario.NOME || 'Usuário';
        const nomeCompleto = usuario.NomeCompleto || usuario.nomeCompleto || nome;
        setNomeUsuario(nome);
        setNomeCompleto(nomeCompleto);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  // Função para buscar produtos com estoque baixo
  const buscarProdutosEstoqueBaixo = async () => {
    if (loadingAlertas) return;
    
    setLoadingAlertas(true);
    try {
      console.log('Buscando produtos com estoque baixo...');
      const response = await fetch(`${API_URL}/produto`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.produto) {
        // Filtrar apenas produtos com estoque baixo
        const produtosEstoqueBaixo = data.produto.filter(produto => 
          produto.quantidade <= produto.minimo
        );

        // Transformar em formato de alerta
        const alertas = produtosEstoqueBaixo.map(produto => ({
          id: produto.id,
          item: produto.nome,
          nivel: produto.quantidade === 0 ? 'crítico' : 'baixo',
          categoria: produto.categoria || 'Sem categoria',
          quantidade: produto.quantidade,
          minimo: produto.minimo,
          produto: produto // Mantém referência ao produto completo
        }));

        setAlertasSuprimentos(alertas);
        console.log(`${alertas.length} produtos com estoque baixo encontrados`);
      } else {
        console.error('Erro ao buscar produtos:', data.error);
        setAlertasSuprimentos([]);
      }
    } catch (error) {
      console.error('Erro na requisição de produtos:', error);
      // Não mostrar alert para não incomodar o usuário
      setAlertasSuprimentos([]);
    } finally {
      setLoadingAlertas(false);
    }
  };

  const toggleMenu = () => {
    if (menuVisible) {
      // Fechar menu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuVisible(false));
    } else {
      // Abrir menu
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const toggleAlertas = () => {
    setAlertasVisible(!alertasVisible);
    // Atualizar dados quando abrir os alertas
    if (!alertasVisible) {
      buscarProdutosEstoqueBaixo();
    }
  };

  const closeMenu = () => {
    if (menuVisible) {
      toggleMenu();
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('usuarioLogado');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para navegar para detalhes do produto
  const irParaProduto = (produto) => {
    setAlertasVisible(false);
    navigation.navigate('ProdutosScreen', { 
      produtoId: produto.id,
      highlightProduct: true 
    });
  };

  const MenuItem = ({ icon, title, onPress, showBorder = true }) => (
    <TouchableOpacity style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#333" style={styles.menuIcon} />
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderAlertaItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.alertaItem}
      onPress={() => irParaProduto(item.produto)}
      activeOpacity={0.7}
    >
      <View style={styles.alertaContent}>
        <View style={[
          styles.alertaIndicator,
          item.nivel === 'crítico' ? styles.alertaCritico : styles.alertaBaixo
        ]} />
        <View style={styles.alertaInfo}>
          <Text style={styles.alertaItemNome}>{item.item}</Text>
          <Text style={styles.alertaCategoria}>{item.categoria}</Text>
          <Text style={styles.alertaQuantidade}>
            Estoque: {item.quantidade} | Mínimo: {item.minimo}
          </Text>
        </View>
      </View>
      <View style={styles.alertaActions}>
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
        <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" style={styles.alertaChevron} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Menu Lateral */}
      {menuVisible && (
        <>
          <Animated.View 
            style={[
              styles.overlay, 
              { opacity: overlayAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.overlayTouchable}
              onPress={closeMenu}
              activeOpacity={1}
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.sideMenu,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.menuHeader}>
               <Image source={NomeLogo} style={{ width: 150, height: 80 }} resizeMode="contain" />
            </View>
            
            <View style={styles.menuContent}>
              <MenuItem 
                icon="grid" 
                title="Dashboard" 
                onPress={() => {
                  closeMenu();
                  navigation.navigate('Home');
                }}
              />
              <MenuItem 
                icon="chatbubble-outline" 
                title="Chat" 
                onPress={() => {
                  closeMenu();
                  navigation.navigate('Chat');
                }}
              />
              <MenuItem 
                icon="library-outline" 
                title="Controle de produtos" 
                onPress={() => {
                  closeMenu();
                  navigation.navigate('ProdutosScreen');
                }}
              />
            </View>
            
            <View style={styles.menuFooter}>
              <View style={styles.separator} />
              
              <MenuItem 
                icon="exit-outline" 
                title="Sair" 
                showBorder={false}
                onPress={() => {
                  closeMenu();
                  handleLogout();
                }}
              />
              
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {nomeCompleto.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  closeMenu();
                  navigation.navigate('Perfil');
                }}>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{nomeCompleto}</Text>
                    <Text style={styles.userEmail}>user@augebit.com</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </>
      )}

      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <Image source={nomeW} style={{ width: 90, height: 30 }} resizeMode="contain" />
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleAlertas}
            >
              <Ionicons name="notifications-outline" size={24} color="#000" />
              {alertasSuprimentos.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {alertasSuprimentos.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
              <Image source={menuIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Card de Alertas */}
      {alertasVisible && (
        <View style={styles.alertasContainer}>
          <View style={styles.alertasCard}>
            <View style={styles.alertasHeader}>
              <View style={styles.alertasTitleContainer}>
                <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
                <Text style={styles.alertasTitle}>Alertas de Estoque</Text>
              </View>
              <TouchableOpacity 
                onPress={buscarProdutosEstoqueBaixo}
                style={styles.refreshButton}
                disabled={loadingAlertas}
              >
                <Ionicons 
                  name="refresh-outline" 
                  size={20} 
                  color={loadingAlertas ? "#9CA3AF" : "#6B7280"} 
                />
              </TouchableOpacity>
            </View>

            {loadingAlertas ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Atualizando...</Text>
              </View>
            ) : alertasSuprimentos.length === 0 ? (
              <View style={styles.emptyAlertasContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                <Text style={styles.emptyAlertasText}>
                  Todos os estoques em níveis adequados
                </Text>
              </View>
            ) : (
              <FlatList
                data={alertasSuprimentos}
                renderItem={renderAlertaItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
                style={styles.alertasList}
                showsVerticalScrollIndicator={false}
              />
            )}

            {alertasSuprimentos.length > 0 && (
              <TouchableOpacity 
                style={styles.verTodosButton}
                onPress={() => {
                  setAlertasVisible(false);
                  navigation.navigate('ProdutosScreen');
                }}
              >
                <Text style={styles.verTodosText}>Ver todos os produtos</Text>
                <Ionicons name="arrow-forward-outline" size={16} color="#6366f1" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Conteúdo da página */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#Ffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#Ffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginTop: 50,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15
  },
  iconButton: {
    padding: 5,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
  },
  // Estilos do Menu Lateral
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000
  },
  overlayTouchable: {
    flex: 1
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#FFF',
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  menuHeader: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'left'
  },
  menuContent: {
    flex: 1,
    paddingTop: 20
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  menuItemNoBorder: {
    borderBottomWidth: 0
  },
  menuIcon: {
    marginRight: 15,
    width: 24
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  menuFooter: {
    paddingBottom: 20
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    marginHorizontal: 20
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 10
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  userAvatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  userEmail: {
    fontSize: 12,
    color: '#666'
  },
  // Estilos para o card de alertas
  alertasContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 100,
    width: width * 0.9,
    maxWidth: 350,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 16,
  },
  alertasCard: {
    width: '100%',
  },
  alertasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertasTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertasTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyAlertasContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyAlertasText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  alertasList: {
    maxHeight: 300,
  },
  alertaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: 8,
  },
  alertaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertaIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  alertaCritico: {
    backgroundColor: '#EF4444',
  },
  alertaBaixo: {
    backgroundColor: '#F59E0B',
  },
  alertaInfo: {
    flex: 1,
  },
  alertaItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  alertaCategoria: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  alertaQuantidade: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  alertaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertaNivel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  nivelCritico: {
    backgroundColor: '#FEE2E2',
  },
  nivelBaixo: {
    backgroundColor: '#FEF3C7',
  },
  alertaNivelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nivelCriticoText: {
    color: '#B91C1C',
  },
  nivelBaixoText: {
    color: '#92400E',
  },
  alertaChevron: {
    marginLeft: 4,
  },
  verTodosButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verTodosText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginRight: 8,
  },
});