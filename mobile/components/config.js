import { Platform } from 'react-native';

// IP local (substitua se quiser fixar manualmente)
// Use seu IP da rede local mostrado no console do Node.js, ex: 192.168.1.5 ou 10.x.x.x
//const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'; // Emulador padrão
 const LOCAL_IP = '192.168.1.111'; // para testes em dispositivos reais

export const API_URL = `http://${LOCAL_IP}:3000`;
