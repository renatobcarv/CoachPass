/**
 * Textos legais do CoachPass. Mantidos como dados para que a página (LegalPage) cuide só da apresentação.
 * Itens marcados "a definir" / "a completar" dependem do responsável legal.
 */

export type LegalBlock = string | { list: string[] } | { note: string };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  kicker: string;
  title: string;
  accent: string;
  version: string;
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
}

export const CONTACT_EMAIL = 'privacidade@coachpass.com.br';

export const privacyPolicy: LegalDoc = {
  kicker: 'Política de Privacidade',
  title: 'Seus dados,',
  accent: 'tratados com cuidado.',
  version: '1.1',
  updatedAt: '20/10/2026',
  intro: [
    'O CoachPass, responsável pelo desenvolvimento e operação da plataforma, valoriza a privacidade e a proteção dos dados pessoais de seus usuários.',
    'Esta Política explica, de forma transparente, quais dados podem ser tratados, para quais finalidades, com quem podem ser compartilhados, por quanto tempo são mantidos e quais são os direitos dos titulares.',
    'O tratamento de dados pessoais realizado pelo CoachPass observa a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD) e demais normas aplicáveis.',
  ],
  sections: [
    {
      id: 'sobre',
      title: 'Sobre o CoachPass',
      blocks: [
        'O CoachPass é uma plataforma digital que reúne aluno, personal trainer e nutricionista na mesma conta, permitindo centralizar informações, acompanhar evolução, visualizar indicadores e utilizar recursos de Inteligência Artificial como apoio à análise dos dados.',
        'A plataforma pode contemplar funcionalidades como:',
        {
          list: [
            'cadastro de alunos, personal trainers e nutricionistas, cada um com o seu perfil de acesso;',
            'vínculo entre aluno e profissionais, por convite;',
            'prescrição e registro de treinos, séries, cargas e repetições;',
            'planos alimentares, refeições e registro de consumo;',
            'avaliação física, medidas corporais e anamnese;',
            'agenda de atendimentos;',
            'acompanhamento de frequência, adesão e evolução;',
            'dashboards, indicadores e recursos de Inteligência Artificial;',
            'gerenciamento de perfil e configurações.',
          ],
        },
      ],
    },
    {
      id: 'responsavel',
      title: 'Quem é responsável pelo tratamento?',
      blocks: [
        'A definição do responsável depende da operação realizada.',
        { note: 'CoachPass como controlador' },
        'O CoachPass atua como controlador em relação aos dados necessários para:',
        {
          list: [
            'criação e administração das contas de alunos e profissionais;',
            'autenticação e segurança da plataforma;',
            'atendimento e suporte;',
            'gerenciamento da relação contratual e dos planos;',
            'prevenção de fraudes e abusos;',
            'funcionamento, segurança e melhoria da plataforma;',
            'cumprimento de obrigações legais e regulatórias.',
          ],
        },
        { note: 'CoachPass como operador' },
        'Quando o personal trainer ou nutricionista utiliza o CoachPass para prescrever e acompanhar seus alunos e pacientes, os dados que ele insere (treinos, planos alimentares, avaliações, anamneses e observações) são tratados pelo CoachPass em nome e de acordo com as instruções do profissional responsável pelo atendimento.',
        'Nessa situação, o profissional atua como controlador e o CoachPass como operador, conforme as características concretas da operação.',
      ],
    },
    {
      id: 'dados',
      title: 'Quais dados podem ser tratados?',
      blocks: [
        { note: 'Dados de cadastro' },
        {
          list: [
            'nome, e-mail e senha (armazenada de forma criptografada);',
            'telefone / WhatsApp;',
            'tipo de perfil (aluno, personal ou nutricionista) e plano contratado;',
            'para profissionais: registro profissional (CREF/CRN) e informações de perfil.',
          ],
        },
        { note: 'Perfil do aluno' },
        'Informados pelo próprio aluno no onboarding ou pelos profissionais vinculados:',
        {
          list: [
            'data de nascimento, sexo, altura, peso e percentual de gordura;',
            'objetivo, nível de experiência, dias e tempo disponíveis para treino e equipamentos;',
            'treinos, cargas, repetições, frequência e histórico;',
            'planos alimentares, refeições e consumo;',
            'medidas corporais, avaliação física e evolução;',
            'observações inseridas pelos profissionais.',
          ],
        },
        { note: 'Dados pessoais sensíveis (saúde)' },
        'Para que treino e alimentação sejam seguros, a plataforma pode tratar alergias alimentares, restrições alimentares, condições médicas, lesões, medicamentos em uso e informações de anamnese. A LGPD classifica dados referentes à saúde como sensíveis, com requisitos específicos.',
        'Esses dados são tratados apenas para a finalidade de acompanhamento do aluno, ficam visíveis somente para o próprio aluno e para os profissionais vinculados a ele, e não são utilizados para publicidade.',
        { note: 'Dados técnicos e de utilização' },
        {
          list: [
            'endereço IP, data e horário de acesso;',
            'informações do dispositivo, navegador e sistema operacional;',
            'registros de autenticação e logs de segurança;',
            'funcionalidades utilizadas e informações para diagnóstico de erros.',
          ],
        },
      ],
    },
    {
      id: 'finalidades',
      title: 'Para quais finalidades os dados são utilizados?',
      blocks: [
        {
          list: [
            'Prestação do serviço — cadastro, autenticação, perfis e funcionalidades da plataforma.',
            'Acompanhamento — permitir que o profissional prescreva, registre e acompanhe o aluno, e que o aluno execute e registre o plano.',
            'Dashboards e indicadores — organizar e apresentar informações de maneira visual.',
            'Inteligência Artificial — sugerir treinos e apontar padrões, tendências ou pontos de atenção.',
            'Segurança — prevenir e investigar acessos não autorizados, fraudes e abusos.',
            'Suporte — responder solicitações e corrigir problemas.',
            'Melhoria da plataforma — identificar erros e aprimorar a experiência.',
            'Obrigações legais e exercício regular de direitos.',
          ],
        },
      ],
    },
    {
      id: 'bases-legais',
      title: 'Bases legais',
      blocks: [
        'O CoachPass não utiliza uma única base legal para todas as operações. A base é definida de acordo com a finalidade, o tipo de dado e as circunstâncias do tratamento. Entre as hipóteses aplicáveis estão:',
        {
          list: [
            'execução de contrato ou de procedimentos preliminares;',
            'cumprimento de obrigação legal ou regulatória;',
            'exercício regular de direitos;',
            'prevenção à fraude e segurança do titular;',
            'consentimento, quando aplicável;',
            'tutela da saúde, para dados sensíveis tratados por profissionais da área, nos termos do art. 11 da LGPD.',
          ],
        },
        'Quando o CoachPass atuar como operador, o tratamento seguirá a base legal e as instruções do respectivo controlador, dentro dos limites legais.',
      ],
    },
    {
      id: 'ia',
      title: 'Inteligência Artificial',
      blocks: [
        'O CoachPass utiliza Inteligência Artificial para sugerir treinos, organizar informações e destacar possíveis pontos de atenção.',
        'A IA não substitui o julgamento do profissional. As sugestões devem ser revisadas pelo personal ou nutricionista responsável, considerando o contexto individual do aluno, e não constituem diagnóstico, prescrição médica ou avaliação profissional.',
        'A geração de treinos ocorre no servidor e pode usar um provedor externo de IA (Google Gemini). O pedido enviado utiliza um perfil anonimizado (objetivo, nível, disponibilidade, restrições) e o catálogo de exercícios, sem enviar nome, e-mail ou telefone. Sem o provedor externo, o sistema usa um gerador local.',
        'Os dados pessoais dos usuários não são utilizados para treinar modelos de IA de terceiros como finalidade automática ou padrão.',
      ],
    },
    {
      id: 'compartilhamento',
      title: 'Compartilhamento de dados',
      blocks: [
        'Dentro da plataforma, os dados do aluno são compartilhados apenas com os profissionais que ele aceitou vincular. Fora dela, o CoachPass compartilha dados somente quando necessário, com:',
        {
          list: [
            'provedores de infraestrutura — hospedagem, banco de dados e armazenamento;',
            'provedores de serviços técnicos — e-mail transacional, monitoramento e segurança;',
            'provedores de Inteligência Artificial — nos termos da seção anterior;',
            'autoridades públicas — quando houver obrigação legal ou ordem judicial.',
          ],
        },
        'O CoachPass não comercializa dados pessoais.',
      ],
    },
    {
      id: 'transferencia',
      title: 'Transferência internacional',
      blocks: [
        'Alguns fornecedores tecnológicos podem estar localizados fora do Brasil. Quando houver transferência internacional de dados pessoais, serão observados os requisitos da LGPD e da Resolução CD/ANPD nº 19/2024.',
      ],
    },
    {
      id: 'armazenamento-local',
      title: 'Cookies e armazenamento local',
      blocks: [
        'Para manter você conectado, o CoachPass guarda no navegador um token de sessão e dados básicos do perfil (armazenamento local), além da preferência de tema claro ou escuro. Esses itens são estritamente necessários ao funcionamento e são apagados ao sair da conta.',
        'Cookies ou ferramentas não essenciais, como métricas de uso, só serão utilizados com transparência e, quando exigido, consentimento.',
      ],
    },
    {
      id: 'seguranca',
      title: 'Segurança da informação',
      blocks: [
        'O CoachPass adota medidas técnicas e administrativas para proteger os dados contra acessos não autorizados, perda, alteração ou divulgação indevida, como:',
        {
          list: [
            'controle de acesso por perfil — cada conta vê apenas o que é dela;',
            'senhas armazenadas com criptografia;',
            'criptografia na transmissão (HTTPS);',
            'registros de acesso, backups e monitoramento;',
            'separação entre ambientes de desenvolvimento e produção;',
            'procedimentos de resposta a incidentes.',
          ],
        },
        'Nenhum sistema conectado à internet é absolutamente seguro, mas mantemos processos para reduzir riscos e responder a eventos de segurança.',
      ],
    },
    {
      id: 'incidentes',
      title: 'Incidentes de segurança',
      blocks: [
        'Em caso de incidente envolvendo dados pessoais que possa causar risco ou dano relevante, o CoachPass adotará os procedimentos de comunicação previstos na LGPD e na Resolução CD/ANPD nº 15/2024. Quando atuar como operador, comunicará o controlador responsável.',
      ],
    },
    {
      id: 'retencao',
      title: 'Retenção e eliminação',
      blocks: [
        'Os dados são mantidos pelo tempo necessário para cumprir a finalidade, executar o contrato, atender obrigações legais e preservar registros de segurança. O histórico de treino e evolução do aluno permanece na conta dele mesmo quando o vínculo com um profissional é encerrado.',
        'Após o fim da finalidade ou a pedido do titular, os dados são eliminados ou anonimizados, salvo quando houver fundamento legal para mantê-los.',
      ],
    },
    {
      id: 'direitos',
      title: 'Seus direitos',
      blocks: [
        'Nos termos da LGPD, você pode solicitar, conforme aplicável:',
        {
          list: [
            'confirmação da existência de tratamento e acesso aos dados;',
            'correção de dados incompletos, inexatos ou desatualizados;',
            'anonimização, bloqueio ou eliminação de dados desnecessários;',
            'portabilidade;',
            'eliminação dos dados tratados com base no consentimento;',
            'informação sobre compartilhamentos;',
            'revogação do consentimento e oposição, quando cabível;',
            'revisão de decisões tomadas unicamente com base em tratamento automatizado.',
          ],
        },
        `Para exercer seus direitos, escreva para ${CONTACT_EMAIL} com o assunto "Solicitação LGPD — [tipo de solicitação]". Poderemos pedir informações para confirmar sua identidade, evitando coleta excessiva.`,
      ],
    },
    {
      id: 'encarregado',
      title: 'Encarregado pelo tratamento (DPO)',
      blocks: [
        { list: ['Encarregado/DPO: a definir', `E-mail: ${CONTACT_EMAIL}`] },
        'Caso o CoachPass se enquadre como agente de tratamento de pequeno porte e esteja dispensado da indicação formal de encarregado (Resolução CD/ANPD nº 2/2022), manterá canal de comunicação adequado com os titulares.',
      ],
    },
    {
      id: 'profissional',
      title: 'Responsabilidades do profissional',
      blocks: [
        'O personal trainer ou nutricionista que utiliza o CoachPass para tratar dados de seus alunos deve:',
        {
          list: [
            'utilizar os dados somente para finalidades legítimas de atendimento;',
            'informar os alunos sobre o tratamento realizado e possuir base legal adequada;',
            'inserir somente as informações necessárias;',
            'manter credenciais seguras e não compartilhá-las;',
            'respeitar os direitos dos titulares e o sigilo profissional do seu conselho (CREF/CRN);',
            'comunicar ao CoachPass suspeitas de acesso indevido.',
          ],
        },
      ],
    },
    {
      id: 'criancas',
      title: 'Crianças e adolescentes',
      blocks: [
        'O tratamento de dados de crianças e adolescentes observará o princípio do melhor interesse e as regras específicas da LGPD. O cadastro de menores de 18 anos deve contar com o consentimento e acompanhamento de pai, mãe ou responsável legal.',
      ],
    },
    {
      id: 'alteracoes',
      title: 'Alterações desta Política',
      blocks: [
        'Esta Política pode ser atualizada para refletir mudanças legais, novas funcionalidades ou melhorias de segurança. Alterações relevantes serão comunicadas na plataforma, e a versão vigente estará sempre disponível nesta página.',
      ],
    },
    {
      id: 'contato',
      title: 'Contato e legislação',
      blocks: [
        {
          list: [
            'Produto: CoachPass',
            `E-mail de privacidade: ${CONTACT_EMAIL}`,
            'CNPJ / endereço / razão social: a completar pelo responsável legal',
          ],
        },
        'Esta Política é regida pela legislação brasileira, em especial a Lei nº 13.709/2018 (LGPD) e as Resoluções CD/ANPD nº 2/2022, 15/2024, 18/2024 e 19/2024.',
      ],
    },
  ],
};

export const termsOfUse: LegalDoc = {
  kicker: 'Termos de Uso',
  title: 'As regras do jogo,',
  accent: 'sem letra miúda.',
  version: '1.0',
  updatedAt: '20/10/2026',
  intro: [
    'Estes Termos de Uso regulam o acesso e a utilização da plataforma CoachPass por alunos, personal trainers e nutricionistas.',
    'Ao criar uma conta ou utilizar a plataforma, você declara que leu e concorda com estes Termos e com a Política de Privacidade. Se não concordar, não utilize o CoachPass.',
  ],
  sections: [
    {
      id: 'servico',
      title: 'O serviço',
      blocks: [
        'O CoachPass é uma ferramenta de gestão e acompanhamento que conecta alunos a personal trainers e nutricionistas. A plataforma organiza treinos, planos alimentares, avaliações, registros e indicadores, e oferece sugestões geradas por Inteligência Artificial.',
        'O CoachPass não presta serviços de educação física, nutrição ou saúde. A prescrição, o ajuste de carga e a conduta são de responsabilidade exclusiva dos profissionais habilitados que utilizam a plataforma.',
      ],
    },
    {
      id: 'conta',
      title: 'Cadastro e conta',
      blocks: [
        {
          list: [
            'Você deve fornecer informações verdadeiras, completas e atualizadas.',
            'Cada conta é pessoal e intransferível; o perfil (aluno ou profissional) é escolhido no cadastro.',
            'Você é responsável por manter sua senha em sigilo e por toda atividade realizada na sua conta.',
            'Menores de 18 anos só podem utilizar a plataforma com consentimento e acompanhamento do responsável legal.',
          ],
        },
      ],
    },
    {
      id: 'profissionais',
      title: 'Profissionais',
      blocks: [
        'Personal trainers e nutricionistas declaram possuir registro ativo e regular no respectivo conselho (CREF ou CRN) e se comprometem a:',
        {
          list: [
            'atuar dentro dos limites da sua habilitação e do código de ética da profissão;',
            'revisar qualquer sugestão gerada pela IA antes de entregá-la ao aluno;',
            'tratar os dados dos alunos conforme a Política de Privacidade e a LGPD;',
            'manter o vínculo apenas com alunos que aceitaram o acompanhamento.',
          ],
        },
      ],
    },
    {
      id: 'alunos',
      title: 'Alunos',
      blocks: [
        {
          list: [
            'Informe corretamente condições de saúde, lesões, alergias, restrições e medicamentos — eles orientam a segurança do seu plano.',
            'Consulte um médico antes de iniciar ou alterar atividade física ou dieta, especialmente se tiver alguma condição de saúde.',
            'Interrompa o exercício e procure ajuda em caso de dor, mal-estar ou qualquer sintoma incomum.',
            'Você decide quais profissionais vincular à sua conta e pode encerrar o vínculo a qualquer momento.',
          ],
        },
      ],
    },
    {
      id: 'ia',
      title: 'Inteligência Artificial',
      blocks: [
        'As sugestões de treino e os indicadores gerados por IA são apoio à decisão. Eles podem conter imprecisões e não substituem a avaliação de um profissional habilitado. O uso das sugestões sem revisão profissional é de responsabilidade de quem as utiliza.',
      ],
    },
    {
      id: 'uso-aceitavel',
      title: 'Uso aceitável',
      blocks: [
        'Não é permitido:',
        {
          list: [
            'compartilhar a conta ou permitir acesso de terceiros;',
            'tentar acessar dados de outros usuários ou explorar vulnerabilidades;',
            'inserir dados de terceiros sem finalidade legítima ou autorização;',
            'utilizar a plataforma para atividades ilícitas, ofensivas ou que violem direitos;',
            'copiar, revender ou fazer engenharia reversa da plataforma.',
          ],
        },
        'O descumprimento pode levar à suspensão ou ao encerramento da conta.',
      ],
    },
    {
      id: 'planos',
      title: 'Planos e pagamentos',
      blocks: [
        'A conta gratuita inclui as funcionalidades básicas e um limite mensal de gerações por IA. Planos pagos, quando disponíveis, terão preço, periodicidade e condições informados antes da contratação. Neste momento a cobrança ainda não está ativa e os valores exibidos são provisórios.',
      ],
    },
    {
      id: 'propriedade',
      title: 'Propriedade intelectual',
      blocks: [
        'A marca, a logo, o software, o design e o catálogo de exercícios do CoachPass pertencem aos seus titulares. Os dados e conteúdos que você insere continuam sendo seus; você concede ao CoachPass a licença necessária para armazená-los e exibi-los a quem você autorizou, apenas para prestar o serviço.',
      ],
    },
    {
      id: 'disponibilidade',
      title: 'Disponibilidade e responsabilidade',
      blocks: [
        'O CoachPass está em desenvolvimento (MVP) e é oferecido no estado em que se encontra. Buscamos manter a plataforma estável e segura, mas podem ocorrer interrupções para manutenção, falhas técnicas ou mudanças de funcionalidade.',
        'Na extensão permitida pela lei, o CoachPass não se responsabiliza por resultados de treino ou dieta, por condutas dos profissionais nem por danos decorrentes do uso indevido da plataforma ou de informações incorretas fornecidas pelos usuários.',
      ],
    },
    {
      id: 'encerramento',
      title: 'Encerramento da conta',
      blocks: [
        `Você pode encerrar sua conta a qualquer momento, solicitando por ${CONTACT_EMAIL}. Os dados serão eliminados ou anonimizados conforme a Política de Privacidade, ressalvadas as hipóteses legais de guarda.`,
      ],
    },
    {
      id: 'alteracoes',
      title: 'Alterações dos Termos',
      blocks: [
        'Estes Termos podem ser atualizados. Mudanças relevantes serão comunicadas na plataforma, e o uso continuado após a atualização indica concordância com a nova versão.',
      ],
    },
    {
      id: 'foro',
      title: 'Legislação e foro',
      blocks: [
        'Estes Termos são regidos pelas leis brasileiras, incluindo o Código de Defesa do Consumidor quando aplicável. Fica eleito o foro do domicílio do usuário para dirimir eventuais controvérsias.',
        { list: [`Contato: ${CONTACT_EMAIL}`, 'CNPJ / endereço / razão social: a completar pelo responsável legal'] },
      ],
    },
  ],
};
