import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from '../components/Layout';

const { height: screenHeight } = Dimensions.get('window');

const SupplyAIChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Olá! Sou o consultor de suprimentos do departamento de Design & Tech. Como posso ajudar você hoje?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(36);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const { height } = event.endCoordinates;
        setKeyboardHeight(height);
        setShowSuggestions(false);
        
        Animated.timing(keyboardOffset, {
          toValue: -height,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setShowSuggestions(messages.length <= 1);
        
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [messages.length]);

  const getGeminiResponse = async (userMessage) => {
    try {
      const API_KEY = 'AIzaSyD-Lz3YQEDQ1MO7uIkg9n-iSbQQ63KrMDU';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      
      const contextualMessage = `Como consultor especializado em suprimentos para Design & Tecnologia, responda de forma profissional e útil no máximo em 7 linhas : ${userMessage}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: contextualMessage }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        console.error('No text generated:', data);
        throw new Error('Resposta vazia da API');
      }
      
      return generatedText;
    } catch (error) {
      console.error("Erro detalhado na API:", error);
      if (error.message.includes('API key')) {
        return "Erro de autenticação. Verifique a chave da API.";
      } else if (error.message.includes('quota')) {
        return "Limite de uso da API atingido. Tente novamente mais tarde.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        return "Problema de conexão. Verifique sua internet e tente novamente.";
      }
      return `Erro técnico: ${error.message}. Tente novamente em alguns instantes.`;
    }
  };

  const sendMessageToGemini = async (message) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      const aiResponse = await getGeminiResponse(message);
      addMessage(aiResponse, 'ai');
    } catch (error) {
      console.error('Erro:', error);
      addMessage('Houve um problema na comunicação. Tente novamente.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (text, sender) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = () => {
    if (inputText.trim() === '' || isLoading) return;
    
    const messageToSend = inputText.trim();
    addMessage(messageToSend, 'user');
    setInputText('');
    setInputHeight(36); // Reset input height
    sendMessageToGemini(messageToSend);
  };

  const quickSuggestions = [
    { text: 'Notebooks para design', emoji: '💻' },
    { text: 'Impressoras 3D', emoji: '🖨️' },
    { text: 'Tablets para desenho', emoji: '📱' },
    { text: 'Armazenamento SSD', emoji: '💾' },
    { text: 'Monitores 4K', emoji: '🖥️' },
    { text: 'Mesa digitalizadora', emoji: '✏️' }
  ];

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleInputChange = (text) => {
    setInputText(text);
  };

  const handleContentSizeChange = (event) => {
    const newHeight = Math.min(Math.max(36, event.nativeEvent.contentSize.height), 120);
    setInputHeight(newHeight);
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const isLastMessage = index === messages.length - 1;
    const isFirstInGroup = index === 0 || messages[index - 1].sender !== item.sender;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.sender !== item.sender;

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        isFirstInGroup && styles.firstInGroup,
        isLastInGroup && styles.lastInGroup
      ]}>
        <Animated.View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isFirstInGroup && (isUser ? styles.userBubbleFirst : styles.aiBubbleFirst),
          isLastInGroup && (isUser ? styles.userBubbleLast : styles.aiBubbleLast),
          !isFirstInGroup && !isLastInGroup && (isUser ? styles.userBubbleMiddle : styles.aiBubbleMiddle)
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.timestampUser : styles.timestampAi
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Layout>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      <View style={styles.container}>
        {/* Header aprimorado */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.headerTitle}>Consultor IA</Text>
            </View>
            <Text style={styles.headerSubtitle}>Design & Tech</Text>
          </View>
        </View>

        {/* Container principal com animação */}
        <Animated.View style={[styles.mainContainer, { transform: [{ translateY: keyboardOffset }] }]}>
          {/* Lista de mensagens */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: keyboardHeight > 0 ? 10 : 20 }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />

          {/* Indicador de digitação melhorado */}
          {isLoading && (
            <Animated.View style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Sugestões rápidas melhoradas */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Sugestões rápidas:</Text>
              <View style={styles.suggestionsGrid}>
                {quickSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setInputText(suggestion.text);
                      inputRef.current?.focus();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Container de input melhorado */}
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, { height: inputHeight }]}
                    value={inputText}
                    onChangeText={handleInputChange}
                    onContentSizeChange={handleContentSizeChange}
                    placeholder="Digite sua mensagem..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={1000}
                    editable={!isLoading}
                    scrollEnabled={false}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (inputText.trim() === '' || isLoading) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={inputText.trim() === '' || isLoading}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isLoading ? "ellipsis-horizontal" : "arrow-up"} 
                      size={20} 
                      color={(inputText.trim() === '' || isLoading) ? '#9CA3AF' : '#FFFFFF'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 16,
    fontWeight: '500',
  },
  mainContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 1,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  firstInGroup: {
    marginTop: 12,
  },
  lastInGroup: {
    marginBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubbleFirst: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 6,
  },
  userBubbleLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 20,
  },
  userBubbleMiddle: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  aiBubbleFirst: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 6,
  },
  aiBubbleLast: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 20,
  },
  aiBubbleMiddle: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  timestampAi: {
    color: '#9CA3AF',
    textAlign: 'left',
  },
  typingIndicator: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: 80
  },
  input: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default SupplyAIChatScreen;