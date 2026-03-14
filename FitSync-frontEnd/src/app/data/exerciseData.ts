export interface ExerciseDetail {
  id: string;
  name: string;
  muscle: string;
  secondaryMuscles: string[];
  videoId: string; // YouTube video ID
  demoImage: string; // Unsplash image shown as preview
  muscleImage: string; // Target muscle image
  overview: string;
  steps: string[];
  tips: string[];
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  equipment: string;
}

const muscleImages: Record<string, string> = {
  Peito: 'https://images.unsplash.com/photo-1716996236807-a45afca9957a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Costas: 'https://images.unsplash.com/photo-1630415188550-9e454489ce3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Ombro: 'https://images.unsplash.com/photo-1769028422208-34eaaddcea6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Bíceps: 'https://images.unsplash.com/photo-1643569571201-cf1d621c4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Tríceps: 'https://images.unsplash.com/photo-1734483768408-87df54bbc89a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Pernas: 'https://images.unsplash.com/photo-1467818488384-3a21f2b79959?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Quadríceps: 'https://images.unsplash.com/photo-1467818488384-3a21f2b79959?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
};

export const exerciseDatabase: Record<string, ExerciseDetail> = {
  'Supino Reto com Barra': {
    id: 'supino-reto',
    name: 'Supino Reto com Barra',
    muscle: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombro anterior'],
    videoId: 'rT7DgCr-3pg',
    demoImage: 'https://images.unsplash.com/photo-1651346847980-ab1c883e8cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Peito'],
    overview: 'O supino reto com barra é o exercício fundamental para o desenvolvimento do peitoral maior. Recruta de forma intensa as fibras centrais e inferiores do peitoral, além de ativar os tríceps e o deltoide anterior.',
    steps: [
      'Deite-se no banco com os pés firmemente apoiados no chão e as escápulas retraídas e deprimidas.',
      'Segure a barra com pegada pronada, ligeiramente mais larga que a largura dos ombros.',
      'Desencaixe a barra e posicione-a diretamente acima do esterno com os cotovelos semi-flexionados.',
      'Desça a barra de forma controlada até tocar levemente o baixo peitoral (4-5cm acima do abdômen).',
      'Empurre a barra explosivamente para cima, expirando durante o esforço.',
      'Mantenha os pulsos neutros e os antebraços perpendiculares ao solo durante todo o movimento.',
    ],
    tips: [
      '💡 Mantenha o arco lombar natural, mas não exagere — os glúteos devem permanecer no banco.',
      '⚡ Mover os cotovelos a ~75° do corpo preserva os ombros e maximiza o recrutamento do peitoral.',
      '🎯 Imagine "quebrar a barra ao meio" para ativar melhor o peitoral durante a subida.',
    ],
    difficulty: 'Intermediário',
    equipment: 'Barra + Anilhas + Banco plano',
  },

  'Crucifixo com Halteres': {
    id: 'crucifixo',
    name: 'Crucifixo com Halteres',
    muscle: 'Peito',
    secondaryMuscles: ['Bíceps (cabeça curta)', 'Ombro anterior'],
    videoId: 'eozdVDA78K0',
    demoImage: 'https://images.unsplash.com/photo-1651346847980-ab1c883e8cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Peito'],
    overview: 'O crucifixo isola o peitoral maior ao eliminar a ação dominante do tríceps. É excelente para alongamento e hipertrofia das fibras externas do peito.',
    steps: [
      'Deite no banco plano segurando um halter em cada mão, com as palmas voltadas uma para a outra.',
      'Posicione os halteres acima do peito com cotovelos levemente flexionados (15-20°).',
      'Abra os braços lentamente formando um arco amplo, descendo até sentir o alongamento do peitoral.',
      'Mantenha a leve flexão nos cotovelos constante durante todo o movimento.',
      'Feche os braços de volta ao ponto de partida espremendo o peitoral no final.',
    ],
    tips: [
      '💡 Imagine abraçar uma árvore grande — o movimento não é linear, e sim um arco.',
      '⚡ Não desça além do nível do banco para proteger o manguito rotador.',
      '🎯 Use cargas menores com foco total na contração e amplitude do movimento.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Halteres + Banco plano',
  },

  'Desenvolvimento Militar': {
    id: 'desenvolvimento-militar',
    name: 'Desenvolvimento Militar',
    muscle: 'Ombro',
    secondaryMuscles: ['Tríceps', 'Trapézio'],
    videoId: '2yjwXTZQDDI',
    demoImage: 'https://images.unsplash.com/photo-1769028422208-34eaaddcea6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Ombro'],
    overview: 'O desenvolvimento militar é o principal exercício composto para os ombros. Desenvolve o deltoide anterior e médio, além de trabalhar os estabilizadores do core.',
    steps: [
      'Posicione-se em pé com os pés na largura dos ombros, com a barra na altura do clavículo.',
      'Segure a barra com pegada pronada, ligeiramente mais larga que os ombros.',
      'Empurre a barra verticalmente para cima enquanto move levemente a cabeça para trás para o passar.',
      'Estenda os braços completamente no ponto mais alto sem travar os cotovelos.',
      'Desça a barra de forma controlada de volta à posição inicial.',
    ],
    tips: [
      '💡 Contraia o glúteo e o abdômen durante todo o movimento para proteger a lombar.',
      '⚡ Não incline o tronco para trás ao subir — o movimento deve vir dos ombros.',
      '🎯 Variações com halteres permitem maior amplitude e são mais amigáveis para os ombros.',
    ],
    difficulty: 'Intermediário',
    equipment: 'Barra + Anilhas',
  },

  'Elevação Lateral': {
    id: 'elevacao-lateral',
    name: 'Elevação Lateral',
    muscle: 'Ombro',
    secondaryMuscles: ['Trapézio médio'],
    videoId: '3VcKaXpzqRo',
    demoImage: 'https://images.unsplash.com/photo-1769028422208-34eaaddcea6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Ombro'],
    overview: 'A elevação lateral é o isolador por excelência do deltoide médio, responsável pela largura dos ombros e pelo aspecto em "V" do corpo.',
    steps: [
      'Fique em pé segurando um halter em cada mão ao lado do corpo, com as palmas voltadas para as coxas.',
      'Levante os braços lateralmente com os cotovelos levemente flexionados, como uma asa de pássaro.',
      'Suba até os braços ficarem paralelos ao solo (90° com o tronco).',
      'Na posição alta, incline ligeiramente o polegar para baixo (gesto de "esvaziar uma lata").',
      'Desça os halteres de forma lenta e controlada (3-4 segundos).',
    ],
    tips: [
      '💡 A fase excêntrica (descida) é tão importante quanto a subida — não jogue os pesos.',
      '⚡ Evite usar o trapézio — se os ombros subirem até as orelhas, o peso está alto demais.',
      '🎯 Use cargas leves: o deltoide médio é um músculo pequeno e a execução incorreta pode lesionar o ombro.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Halteres',
  },

  'Tríceps Pulley': {
    id: 'triceps-pulley',
    name: 'Tríceps Pulley',
    muscle: 'Tríceps',
    secondaryMuscles: ['Antebraço'],
    videoId: 'vB5OHsJ3EME',
    demoImage: 'https://images.unsplash.com/photo-1734483768408-87df54bbc89a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Tríceps'],
    overview: 'O tríceps pulley é um excelente isolador das três cabeças do tríceps, com ênfase na cabeça lateral. O uso do cabo mantém tensão constante durante todo o movimento.',
    steps: [
      'Posicione-se em frente à polia alta segurando a corda ou barra com pegada pronada.',
      'Mantenha os cotovelos fixos ao lado do corpo, alinhados com o tronco.',
      'Empurre a corda/barra para baixo estendendo completamente os cotovelos.',
      'Na posição mais baixa, separe as pontas da corda para maximizar a contração.',
      'Retorne de forma controlada até os antebraços ficarem paralelos ao solo.',
    ],
    tips: [
      '💡 Os cotovelos devem permanecer imóveis — se eles se afastam do corpo, o peso está alto.',
      '⚡ Use a variação com corda para maior amplitude e ativação das 3 cabeças do tríceps.',
      '🎯 Um leve avanço do tronco (10-15°) pode melhorar o alinhamento biomecânico.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Polia alta + Corda ou Barra',
  },

  'Barra Fixa Pronada': {
    id: 'barra-fixa',
    name: 'Barra Fixa Pronada',
    muscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Romboides', 'Infraespinhal'],
    videoId: 'eGo4IYlbE5g',
    demoImage: 'https://images.unsplash.com/photo-1574340328797-4d35191976e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Costas'],
    overview: 'A barra fixa pronada (pullup) é considerada o "agachamento das costas". É um exercício composto que desenvolve o latíssimo do dorso em toda sua extensão, criando largura nas costas.',
    steps: [
      'Segure a barra com pegada pronada, mais larga que a largura dos ombros.',
      'Deixe os braços completamente estendidos e os pés soltos (ou cruzados atrás).',
      'Inicie o movimento retraindo e deprimindo as escápulas antes de flexionar os cotovelos.',
      'Puxe o corpo para cima conduzindo pelo cotovelo até o queixo ultrapassar a barra.',
      'Desça de forma lenta e controlada por 3-4 segundos até a extensão completa.',
    ],
    tips: [
      '💡 O movimento começa nas escápulas — "coloque os ombros no bolso de trás".',
      '⚡ Evite o kipping (balançar o corpo) — o movimento controlado gera muito mais hipertrofia.',
      '🎯 Se não conseguir uma repetição completa, use elástico de resistência ou a lat pulldown.',
    ],
    difficulty: 'Avançado',
    equipment: 'Barra fixa',
  },

  'Remada Curvada': {
    id: 'remada-curvada',
    name: 'Remada Curvada',
    muscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Deltoide posterior', 'Lombar'],
    videoId: 'G8l_8chR5BE',
    demoImage: 'https://images.unsplash.com/photo-1574340328797-4d35191976e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Costas'],
    overview: 'A remada curvada com barra é um dos principais exercícios de massa para as costas, desenvolvendo espessura e força. Recrutam o latíssimo, romboides, trapézio e deltoide posterior.',
    steps: [
      'Segure a barra na largura dos ombros com pegada pronada e joelhos levemente flexionados.',
      'Incline o tronco para frente entre 45-90° mantendo a coluna neutra e o abdômen contraído.',
      'Puxe a barra em direção ao umbigo/baixo peitoral, conduzindo pelos cotovelos.',
      'No ponto de contração máxima, esprema as escápulas entre si por 1 segundo.',
      'Retorne a barra de forma controlada até os braços ficarem completamente estendidos.',
    ],
    tips: [
      '💡 Mantenha a cabeça em posição neutra — não olhe para cima, isso força o pescoço.',
      '⚡ Direcione os cotovelos para trás e para cima, não para os lados.',
      '🎯 Pegar com pegada supinada (palmas para cima) aumenta a ativação do bíceps e parte inferior do dorso.',
    ],
    difficulty: 'Intermediário',
    equipment: 'Barra + Anilhas',
  },

  'Remada Unilateral': {
    id: 'remada-unilateral',
    name: 'Remada Unilateral',
    muscle: 'Costas',
    secondaryMuscles: ['Bíceps', 'Core'],
    videoId: 'pYcpY20QaE8',
    demoImage: 'https://images.unsplash.com/photo-1574340328797-4d35191976e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Costas'],
    overview: 'A remada unilateral com halter é ideal para corrigir desequilíbrios entre os lados, permitindo maior amplitude de movimento e maior ativação do latíssimo individualmente.',
    steps: [
      'Apoie uma mão e o joelho do mesmo lado no banco, com o tronco paralelo ao solo.',
      'Segure o halter com o braço estendido, mantendo a coluna neutra.',
      'Puxe o halter em direção ao quadril conduzindo pelo cotovelo.',
      'Na contração máxima, eleve o cotovelo ligeiramente acima do nível das costas.',
      'Desça o halter de forma lenta e controlada até a extensão completa.',
    ],
    tips: [
      '💡 Permita leve rotação do ombro durante a extensão para maximizar o alongamento do latíssimo.',
      '⚡ Não torça o tronco ao puxar — o movimento deve vir do cotovelo, não do quadril.',
      '🎯 Segure por 1-2 segundos na contração para maior recrutamento das fibras musculares.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Halter + Banco',
  },

  'Rosca Direta': {
    id: 'rosca-direta',
    name: 'Rosca Direta',
    muscle: 'Bíceps',
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    videoId: 'ykJmrZ5v0Oo',
    demoImage: 'https://images.unsplash.com/photo-1643569571201-cf1d621c4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Bíceps'],
    overview: 'A rosca direta com barra é o exercício clássico de isolamento para o bíceps braquial. Recruta a cabeça longa e curta do bíceps e o braquial.',
    steps: [
      'Fique em pé com os pés na largura dos ombros segurando a barra com pegada supinada.',
      'Mantenha os cotovelos fixos ao lado do corpo, com os ombros para trás e o peito aberto.',
      'Flexione os cotovelos levantando a barra em direção ao ombro de forma controlada.',
      'No ponto máximo, gire os pulsos levemente para fora para maior contração do bíceps.',
      'Desça a barra lentamente por 3-4 segundos até a extensão quase completa.',
    ],
    tips: [
      '💡 Não balance o corpo para ajudar na subida — isso transfere o esforço para os lombares.',
      '⚡ Pare antes da extensão total para manter tensão constante no bíceps.',
      '🎯 Use a barra W (EZ-bar) se sentir desconforto nos pulsos com a barra reta.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Barra reta ou W + Anilhas',
  },

  'Rosca Martelo': {
    id: 'rosca-martelo',
    name: 'Rosca Martelo',
    muscle: 'Bíceps',
    secondaryMuscles: ['Braquial', 'Braquiorradial'],
    videoId: 'TwD-YGVP4Bk',
    demoImage: 'https://images.unsplash.com/photo-1643569571201-cf1d621c4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Bíceps'],
    overview: 'A rosca martelo trabalha fortemente o braquial e o braquiorradial, adicionando espessura ao braço. A pegada neutra é mais amigável para os pulsos.',
    steps: [
      'Segure os halteres com pegada neutra (palmas voltadas uma para a outra) ao lado do corpo.',
      'Mantenha os cotovelos fixos ao lado do tronco durante todo o movimento.',
      'Flexione os cotovelos levantando os halteres em paralelo ao corpo sem girar o pulso.',
      'Suba até os antebraços ficarem paralelos ao solo ou um pouco acima.',
      'Desça de forma controlada até a extensão quase completa.',
    ],
    tips: [
      '💡 Pode ser feito alternando os braços para maior concentração em cada lado.',
      '⚡ Mantenha os pulsos neutros — não os flexione nem estenda durante o movimento.',
      '🎯 A variação com cabo mantém tensão constante no braquial em toda amplitude.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Halteres',
  },

  'Rosca Concentrada': {
    id: 'rosca-concentrada',
    name: 'Rosca Concentrada',
    muscle: 'Bíceps',
    secondaryMuscles: ['Braquial'],
    videoId: 'Jvj2wV0vOYU',
    demoImage: 'https://images.unsplash.com/photo-1643569571201-cf1d621c4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    muscleImage: muscleImages['Bíceps'],
    overview: 'A rosca concentrada é a queen do isolamento do bíceps, eliminando quase toda compensação e focando o trabalho no pico do bíceps braquial.',
    steps: [
      'Sente-se numa cadeira inclinando levemente o tronco para frente.',
      'Apoie a parte posterior do braço na parte interna da coxa ipsilateral.',
      'Segure o halter com pegada supinada com o braço completamente estendido.',
      'Flexione o cotovelo levantando o halter em direção ao ombro com movimento puro.',
      'Contraia o bíceps no ponto máximo por 1-2 segundos antes de descer.',
    ],
    tips: [
      '💡 O cotovelo apoiado na coxa serve apenas como apoio — não empurre a perna.',
      '⚡ Use cargas moderadas — o objetivo é isolamento máximo, não carga máxima.',
      '🎯 Incline o halter para fora no ponto de contração para maior ativação do pico.',
    ],
    difficulty: 'Iniciante',
    equipment: 'Halter + Banco ou cadeira',
  },
};

export function getExerciseDetail(name: string): ExerciseDetail | null {
  return exerciseDatabase[name] || null;
}
