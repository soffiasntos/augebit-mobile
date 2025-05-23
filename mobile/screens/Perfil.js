import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../components/Layout';

export default function Perfil() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: '',
    nome: '',
    nomeCompleto: '',
    email: '',
    senha: '',
    telefone: '',
    cargo: '',
    departamento: '',
    dataAdmissao: ''
  });
  const [editedData, setEditedData] = useState({ ...userData });

  const API_URL = 'http://10.136.23.237:3000'; // Ajuste conforme seu IP

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      setLoading(true);
      const userDataStored = await AsyncStorage.getItem('usuarioLogado');
      
      if (userDataStored) {
        const usuario = JSON.parse(userDataStored);
        console.log('Usuario do AsyncStorage:', usuario);
        
        // Buscar dados atualizados do servidor
        const response = await fetch(`${API_URL}/funcionario/${usuario.id}`);
        const result = await response.json();
        
        if (result.success) {
          const dadosServidor = result.funcionario;
          const newUserData = {
            id: dadosServidor.id,
            nome: dadosServidor.nome || dadosServidor.Nome || '',
            nomeCompleto: dadosServidor.NomeCompleto || dadosServidor.nomeCompleto || '',
            email: dadosServidor.email || '',
            senha: '•••••••', // Não mostrar senha real
            telefone: dadosServidor.Telefone || dadosServidor.telefone || '',
            cargo: dadosServidor.Cargo || dadosServidor.cargo || '',
            departamento: dadosServidor.Departamento || dadosServidor.departamento || '',
            dataAdmissao: dadosServidor.DataAdmissao || dadosServidor.dataAdmissao || ''
          };
          
          setUserData(newUserData);
          setEditedData(newUserData);
        } else {
          // Se falhar, usar dados do AsyncStorage
          const newUserData = {
            id: usuario.id,
            nome: usuario.nome || usuario.Nome || '',
            nomeCompleto: usuario.NomeCompleto || usuario.nomeCompleto || '',
            email: usuario.email || '',
            senha: '•••••••',
            telefone: usuario.Telefone || usuario.telefone || '',
            cargo: usuario.Cargo || usuario.cargo || '',
            departamento: usuario.Departamento || usuario.departamento || '',
            dataAdmissao: usuario.DataAdmissao || usuario.dataAdmissao || ''
          };
          
          setUserData(newUserData);
          setEditedData(newUserData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Preparar dados para envio (sem senha se não foi alterada)
      const dadosParaEnvio = {
        nome: editedData.nome,
        nomeCompleto: editedData.nomeCompleto,
        email: editedData.email,
        telefone: editedData.telefone,
        cargo: editedData.cargo,
        departamento: editedData.departamento
      };

      // Se o campo senha foi alterado (não é mais •••••••), incluir na atualização
      if (editedData.senha !== '•••••••' && editedData.senha.trim() !== '') {
        dadosParaEnvio.senha = editedData.senha;
      }

      console.log('Enviando dados para atualizar:', dadosParaEnvio);

      // Atualizar no servidor
      const response = await fetch(`${API_URL}/funcionario/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnvio)
      });

      const result = await response.json();
      console.log('Resposta do servidor:', result);

      if (result.success) {
        // Atualizar AsyncStorage
        const currentUser = await AsyncStorage.getItem('usuarioLogado');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const updatedUser = {
            ...user,
            nome: editedData.nome,
            Nome: editedData.nome,
            NomeCompleto: editedData.nomeCompleto,
            nomeCompleto: editedData.nomeCompleto,
            email: editedData.email,
            Telefone: editedData.telefone,
            telefone: editedData.telefone,
            Cargo: editedData.cargo,
            cargo: editedData.cargo,
            Departamento: editedData.departamento,
            departamento: editedData.departamento
          };
          
          await AsyncStorage.setItem('usuarioLogado', JSON.stringify(updatedUser));
        }
        
        // Atualizar estado local
        const updatedUserData = { ...editedData };
        if (editedData.senha === '•••••••' || editedData.senha.trim() === '') {
          updatedUserData.senha = '•••••••';
        }
        
        setUserData(updatedUserData);
        setEditedData(updatedUserData);
        setIsEditing(false);
        
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Erro', result.message || 'Não foi possível salvar as alterações.');
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData({ ...userData });
    setIsEditing(false);
  };

  const renderField = (label, value, key, editable = true, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={editedData[key]}
          onChangeText={(text) => setEditedData(prev => ({ ...prev, [key]: text }))}
          keyboardType={keyboardType}
          placeholder={`Digite ${label.toLowerCase()}`}
          secureTextEntry={secureTextEntry}
          editable={!loading}
        />
      ) : (
        <View style={styles.fieldValueContainer}>
          <Text style={styles.fieldValue}>{value}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <Layout showHeader={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout showHeader={true}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face' }}
                style={styles.avatarImage}
              />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userData.nomeCompleto}</Text>
          <Text style={styles.profileRole}>{userData.cargo}</Text>
        </View>

        {/* Botão Editar */}
        <View style={styles.actionsContainer}>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
              disabled={loading}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActionsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]} 
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.sectionContent}>
            {renderField('NOME', userData.nome, 'nome')}
            {renderField('NOME COMPLETO', userData.nomeCompleto, 'nomeCompleto')}
            {renderField('EMAIL', userData.email, 'email', true, 'email-address')}
            {renderField('SENHA', userData.senha, 'senha', true, 'default', true)}
            {renderField('TELEFONE', userData.telefone, 'telefone', true, 'phone-pad')}
          </View>
        </View>

        {/* Informações Profissionais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>
          <View style={styles.sectionContent}>
            {renderField('CARGO', userData.cargo, 'cargo')}
            {renderField('DEPARTAMENTO', userData.departamento, 'departamento')}
            {renderField('DATA DE ADMISSÃO', userData.dataAdmissao, 'dataAdmissao', false)}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  customHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerIcon: {
    padding: 5,
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  editButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionContent: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  fieldValueContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  bottomSpacing: {
    height: 50,
  },
});
