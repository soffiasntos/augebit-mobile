import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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
  
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    carregarNome();
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

  const MenuItem = ({ icon, title, onPress, showBorder = true }) => (
    <TouchableOpacity style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#333" style={styles.menuIcon} />
      <Text style={styles.menuItemText}>{title}</Text>
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
                  // navigation.navigate('Dashboard');
                }}
              />
              <MenuItem 
                icon="chatbubble-outline" 
                title="Chat" 
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Chat');
                }}
              />
              <MenuItem 
                icon="library-outline" 
                title="Controle de produtos" 
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Produtos');
                }}
              />
            </View>
            
            <View style={styles.menuFooter}>
              <View style={styles.separator} />
              <MenuItem 
                icon="settings-outline" 
                title="Configurações" 
                showBorder={false}
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Configuracoes');
                }}
              />
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
    navigation.navigate('Perfil'); // <-- MUDE AQUI: de 'PerfilScreen' para 'Perfil'
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
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
              <Image source={menuIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </TouchableOpacity>
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
    padding: 5
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
  }
});
