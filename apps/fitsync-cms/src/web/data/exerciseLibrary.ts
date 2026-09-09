export interface Exercise {
  name: string;
  muscle: string;
  equipment: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  secondaryMuscles?: string[];
}

export const exerciseLibrary: Record<string, Exercise[]> = {
  Peito: [
    // Iniciante
    { name: 'Flexão de Braço', muscle: 'Peito', equipment: 'Peso corporal', difficulty: 'Iniciante' },
    { name: 'Supino Reto com Halteres', muscle: 'Peito', equipment: 'Halteres', difficulty: 'Iniciante' },
    { name: 'Crucifixo na Máquina', muscle: 'Peito', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Flexão Inclinada', muscle: 'Peito', equipment: 'Banco', difficulty: 'Iniciante' },
    { name: 'Press no Chest Press', muscle: 'Peito', equipment: 'Máquina', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Supino Reto com Barra', muscle: 'Peito', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Supino Inclinado com Barra', muscle: 'Peito', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Crucifixo com Halteres', muscle: 'Peito', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Supino Inclinado com Halteres', muscle: 'Peito', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Cross Over no Cabo', muscle: 'Peito', equipment: 'Polia dupla', difficulty: 'Intermediário' },
    { name: 'Paralelas para Peito', muscle: 'Peito', equipment: 'Barras paralelas', difficulty: 'Intermediário' },
    { name: 'Supino Declinado', muscle: 'Peito', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Pullover com Halter', muscle: 'Peito', equipment: 'Halter', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Supino Guilhotina', muscle: 'Peito', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Flexão com Peso', muscle: 'Peito', equipment: 'Anilha', difficulty: 'Avançado' },
    { name: 'Supino com Pegada Fechada', muscle: 'Peito', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Flexão Arqueira', muscle: 'Peito', equipment: 'Peso corporal', difficulty: 'Avançado' },
  ],

  Costas: [
    // Iniciante
    { name: 'Remada Cavalinho', muscle: 'Costas', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Pulldown Frontal', muscle: 'Costas', equipment: 'Polia alta', difficulty: 'Iniciante' },
    { name: 'Remada Baixa no Cabo', muscle: 'Costas', equipment: 'Polia baixa', difficulty: 'Iniciante' },
    { name: 'Pulldown com Pegada Neutra', muscle: 'Costas', equipment: 'Polia alta', difficulty: 'Iniciante' },
    { name: 'Remada Máquina Articulada', muscle: 'Costas', equipment: 'Máquina', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Barra Fixa Pronada', muscle: 'Costas', equipment: 'Barra fixa', difficulty: 'Intermediário' },
    { name: 'Remada Curvada', muscle: 'Costas', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Remada Unilateral', muscle: 'Costas', equipment: 'Halter', difficulty: 'Intermediário' },
    { name: 'Barra Fixa Supinada', muscle: 'Costas', equipment: 'Barra fixa', difficulty: 'Intermediário' },
    { name: 'Remada T-Bar', muscle: 'Costas', equipment: 'Barra T', difficulty: 'Intermediário' },
    { name: 'Pulldown com Triângulo', muscle: 'Costas', equipment: 'Polia alta', difficulty: 'Intermediário' },
    { name: 'Remada Serrote', muscle: 'Costas', equipment: 'Halter + Banco', difficulty: 'Intermediário' },
    { name: 'Levantamento Terra', muscle: 'Costas', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Pullover no Cabo', muscle: 'Costas', equipment: 'Polia alta', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Barra Fixa com Peso', muscle: 'Costas', equipment: 'Barra + Anilha', difficulty: 'Avançado' },
    { name: 'Remada Pendlay', muscle: 'Costas', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Muscle Up', muscle: 'Costas', equipment: 'Barra fixa', difficulty: 'Avançado' },
    { name: 'Levantamento Terra Sumô', muscle: 'Costas', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
  ],

  Ombro: [
    // Iniciante
    { name: 'Elevação Frontal com Halteres', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Iniciante' },
    { name: 'Elevação Lateral na Máquina', muscle: 'Ombro', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Desenvolvimento na Máquina', muscle: 'Ombro', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Elevação Lateral com Cabo', muscle: 'Ombro', equipment: 'Polia baixa', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Desenvolvimento Militar', muscle: 'Ombro', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Elevação Lateral', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Desenvolvimento com Halteres', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Elevação Frontal com Barra', muscle: 'Ombro', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Crucifixo Inverso', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Remada Alta', muscle: 'Ombro', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Elevação Lateral 90°', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Face Pull', muscle: 'Ombro', equipment: 'Polia alta', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Desenvolvimento Arnold', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Avançado' },
    { name: 'Desenvolvimento Behind Neck', muscle: 'Ombro', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Handstand Push-up', muscle: 'Ombro', equipment: 'Peso corporal', difficulty: 'Avançado' },
    { name: 'Elevação Lateral com Drop Set', muscle: 'Ombro', equipment: 'Halteres', difficulty: 'Avançado' },
  ],

  Bíceps: [
    // Iniciante
    { name: 'Rosca Direta no Cabo', muscle: 'Bíceps', equipment: 'Polia baixa', difficulty: 'Iniciante' },
    { name: 'Rosca Scott na Máquina', muscle: 'Bíceps', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Rosca Alternada', muscle: 'Bíceps', equipment: 'Halteres', difficulty: 'Iniciante' },
    { name: 'Rosca Martelo', muscle: 'Bíceps', equipment: 'Halteres', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Rosca Direta', muscle: 'Bíceps', equipment: 'Barra W', difficulty: 'Intermediário' },
    { name: 'Rosca Scott', muscle: 'Bíceps', equipment: 'Barra W', difficulty: 'Intermediário' },
    { name: 'Rosca Concentrada', muscle: 'Bíceps', equipment: 'Halter', difficulty: 'Intermediário' },
    { name: 'Rosca Inversa', muscle: 'Bíceps', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Rosca 21', muscle: 'Bíceps', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Rosca Spider', muscle: 'Bíceps', equipment: 'Barra + Banco', difficulty: 'Intermediário' },
    { name: 'Rosca Cross no Cabo', muscle: 'Bíceps', equipment: 'Polia dupla', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Rosca Drag Curl', muscle: 'Bíceps', equipment: 'Barra', difficulty: 'Avançado' },
    { name: 'Rosca com Barra Reta Pegada Larga', muscle: 'Bíceps', equipment: 'Barra', difficulty: 'Avançado' },
    { name: 'Rosca Zottman', muscle: 'Bíceps', equipment: 'Halteres', difficulty: 'Avançado' },
  ],

  Tríceps: [
    // Iniciante
    { name: 'Tríceps Pulley com Corda', muscle: 'Tríceps', equipment: 'Polia alta', difficulty: 'Iniciante' },
    { name: 'Tríceps Pulley com Barra', muscle: 'Tríceps', equipment: 'Polia alta', difficulty: 'Iniciante' },
    { name: 'Tríceps na Máquina', muscle: 'Tríceps', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Tríceps Banco', muscle: 'Tríceps', equipment: 'Banco', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Tríceps Testa', muscle: 'Tríceps', equipment: 'Barra W', difficulty: 'Intermediário' },
    { name: 'Tríceps Francês', muscle: 'Tríceps', equipment: 'Halter', difficulty: 'Intermediário' },
    { name: 'Mergulho', muscle: 'Tríceps', equipment: 'Barras paralelas', difficulty: 'Intermediário' },
    { name: 'Tríceps Coice', muscle: 'Tríceps', equipment: 'Halter', difficulty: 'Intermediário' },
    { name: 'Tríceps Supino Fechado', muscle: 'Tríceps', equipment: 'Barra', difficulty: 'Intermediário' },
    { name: 'Tríceps Overhead no Cabo', muscle: 'Tríceps', equipment: 'Polia alta', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Mergulho com Peso', muscle: 'Tríceps', equipment: 'Barras + Anilha', difficulty: 'Avançado' },
    { name: 'Tríceps JM Press', muscle: 'Tríceps', equipment: 'Barra', difficulty: 'Avançado' },
    { name: 'Tríceps California Press', muscle: 'Tríceps', equipment: 'Barra', difficulty: 'Avançado' },
  ],

  Pernas: [
    // Iniciante
    { name: 'Cadeira Extensora', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Cadeira Flexora', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Leg Press 45°', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Panturrilha Sentado', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Agachamento Sumô', muscle: 'Pernas', equipment: 'Peso corporal', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Agachamento Livre', muscle: 'Pernas', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Agachamento Frontal', muscle: 'Pernas', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Stiff', muscle: 'Pernas', equipment: 'Barra + Anilhas', difficulty: 'Intermediário' },
    { name: 'Afundo', muscle: 'Pernas', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Agachamento Búlgaro', muscle: 'Pernas', equipment: 'Halteres', difficulty: 'Intermediário' },
    { name: 'Cadeira Adutora', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    { name: 'Cadeira Abdutora', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    { name: 'Hack Machine', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    { name: 'Mesa Flexora', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    { name: 'Panturrilha em Pé', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    { name: 'Leg Press Unilateral', muscle: 'Pernas', equipment: 'Máquina', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Agachamento Pistol', muscle: 'Pernas', equipment: 'Peso corporal', difficulty: 'Avançado' },
    { name: 'Levantamento Terra Romeno', muscle: 'Pernas', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Agachamento Zercher', muscle: 'Pernas', equipment: 'Barra + Anilhas', difficulty: 'Avançado' },
    { name: 'Box Jump', muscle: 'Pernas', equipment: 'Caixa pliométrica', difficulty: 'Avançado' },
    { name: 'Walking Lunges com Peso', muscle: 'Pernas', equipment: 'Halteres', difficulty: 'Avançado' },
  ],

  Abdômen: [
    // Iniciante
    { name: 'Abdominal Supra', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Iniciante' },
    { name: 'Prancha Isométrica', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Iniciante' },
    { name: 'Abdominal na Máquina', muscle: 'Abdômen', equipment: 'Máquina', difficulty: 'Iniciante' },
    { name: 'Elevação de Joelhos', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Iniciante' },
    
    // Intermediário
    { name: 'Abdominal Infra', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Intermediário' },
    { name: 'Prancha Lateral', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Intermediário' },
    { name: 'Abdominal Canivete', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Intermediário' },
    { name: 'Russian Twist', muscle: 'Abdômen', equipment: 'Anilha', difficulty: 'Intermediário' },
    { name: 'Abdominal no Cabo', muscle: 'Abdômen', equipment: 'Polia alta', difficulty: 'Intermediário' },
    { name: 'Mountain Climber', muscle: 'Abdômen', equipment: 'Peso corporal', difficulty: 'Intermediário' },
    
    // Avançado
    { name: 'Dragon Flag', muscle: 'Abdômen', equipment: 'Banco', difficulty: 'Avançado' },
    { name: 'L-Sit', muscle: 'Abdômen', equipment: 'Barras paralelas', difficulty: 'Avançado' },
    { name: 'Elevação de Pernas na Barra', muscle: 'Abdômen', equipment: 'Barra fixa', difficulty: 'Avançado' },
    { name: 'Ab Wheel Rollout', muscle: 'Abdômen', equipment: 'Roda abdominal', difficulty: 'Avançado' },
  ],
};

export const getMuscleGroups = () => Object.keys(exerciseLibrary);

export const getExercisesByMuscle = (muscle: string): Exercise[] => {
  return exerciseLibrary[muscle] || [];
};

export const difficultyColors = {
  Iniciante: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  Intermediário: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  Avançado: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};
