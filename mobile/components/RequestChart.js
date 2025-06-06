import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const API_URL = 'http://10.136.23.106:3000/api/requisicoes'; // Substitua pelo seu IP ou use variável de ambiente

const RequestChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    fetchRequestData();
  }, []);

  const fetchRequestData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data from:', API_URL);
      
      const response = await fetch(API_URL);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (!data || data.length === 0) {
        throw new Error('Nenhum dado disponível');
      }
      
      const monthsOrder = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      const sortedData = data.sort((a, b) => 
        monthsOrder.indexOf(a.mes) - monthsOrder.indexOf(b.mes)
      );

      const labels = sortedData.map(item => item.mes.substring(0, 3));
      const values = sortedData.map(item => item.total_requisicoes);
      const total = values.reduce((sum, current) => sum + current, 0);

      setChartData({
        labels: labels,
        datasets: [{ data: values }],
      });
      setTotalRequests(total);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text 
          style={styles.retryText}
          onPress={fetchRequestData}
        >
          Tentar novamente
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>
        Requisições nos <Text style={styles.chartTitleHighlight}>últimos meses</Text>
      </Text>
      
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - 88}
          height={140}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          chartConfig={{
            backgroundColor: '#0A0A0D',
            backgroundGradientFrom: '#0A0A0D',
            backgroundGradientTo: '#0A0A0D',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForLabels: {
              fontFamily: 'Poppins-Regular',
              fontSize: 10,
            },
            barPercentage: 0.5,
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total de requisições: <Text style={{ color: '#FFFFFF' }}>{totalRequests}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#0A0A0D',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
    marginBottom: 20,
    lineHeight: 24,
  },
  chartTitleHighlight: {
    color: '#6366F1',
    fontFamily: 'Poppins-SemiBold',
  },
  chartContainer: {
    alignItems: 'center',
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0D',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  errorContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0D',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default RequestChart;