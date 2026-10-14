import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TutorialScreenProps {
  onFinishTutorial: () => void;
}

export default function TutorialScreen({ onFinishTutorial }: TutorialScreenProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao Brain Studio!",
      description: "Sua plataforma gamificada de estudos com inteligência artificial para organizar sua rotina acadêmica de forma simples e eficiente.",
      icon: "school-outline" as const,
    },
    {
      title: "Conheça a Lumina",
      description: "Sua assistente de IA integrada está pronta para tirar dúvidas de matérias, ajudar com resumos e otimizar seu cronograma de estudos.",
      icon: "sparkles-outline" as const,
    },
    {
      title: "Mantenha seus Streaks",
      description: "Estude todos os dias, mantenha sua ofensiva ativa e desbloqueie conquistas exclusivas enquanto evolui nos estudos.",
      icon: "flame-outline" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView corrigido com contentContainerStyle para garantir a rolagem */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.headerContainer}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Brain Studio</Text>
          </View>
        </View>

        {/* Card Principal do Tutorial */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name={steps[activeStep].icon} size={64} color="#6366f1" />
          </View>

          <Text style={styles.title}>{steps[activeStep].title}</Text>
          <Text style={styles.description}>{steps[activeStep].description}</Text>

          {/* Indicadores de Passo (Dots) */}
          <View style={styles.pagination}>
            {steps.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  activeStep === index && styles.activeDot
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Botões de Navegação */}
        <View style={styles.buttonContainer}>
          {activeStep < steps.length - 1 ? (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => setActiveStep(activeStep + 1)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Próximo</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={onFinishTutorial}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Começar Agora</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {activeStep > 0 && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setActiveStep(activeStep - 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Fundo moderno escuro
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  badgeContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#818cf8',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#6366f1',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
