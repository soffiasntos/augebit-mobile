import { Platform } from 'react-native';

//const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'; // Emulador padrão
 const LOCAL_IP = '192.168.1.111'; // Professor para testes em dispositivos reais troque o --- pelo ip do seu computador

export const API_URL = `http://${LOCAL_IP}:3000`;



