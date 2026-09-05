# CoachPass

> **Gestão, acompanhamento e análise de dados para personal trainers.**

O **CoachPass** é uma plataforma de gestão desenvolvida para **personal trainers autônomos**, com o objetivo de centralizar em um único ambiente as principais informações relacionadas ao cadastro, acompanhamento e evolução dos alunos.

A solução busca reduzir a fragmentação de dados entre **planilhas, fichas de treino e registros separados**, permitindo ao profissional organizar sua carteira de alunos, acompanhar treinos, frequência, adesão e desempenho, consultar históricos e visualizar de forma mais clara quais alunos demandam atenção.

Como diferencial, o CoachPass integra **gestão, acompanhamento e análise de dados**, utilizando **Inteligência Artificial como ferramenta de apoio à interpretação das informações registradas na plataforma**.

> **A IA apoia a análise. O profissional continua responsável pela decisão.**

---

# 🎯 Objetivo

O objetivo do CoachPass é desenvolver e validar uma plataforma capaz de tornar o acompanhamento da carteira de alunos **mais organizado, centralizado e orientado por dados**.

O sistema busca permitir que o personal trainer:

* Cadastre e organize seus alunos;
* Acompanhe treinos e evolução;
* Registre peso, frequência e desempenho;
* Acompanhe a adesão dos alunos;
* Consulte históricos;
* Visualize indicadores em dashboards;
* Identifique alunos que demandam atenção;
* Utilize Inteligência Artificial para auxiliar na interpretação dos dados.

O **MVP** terá como finalidade validar se essa centralização e os recursos de análise contribuem efetivamente para tornar a gestão da carteira de alunos mais eficiente.

---

# 🚨 Problema

Personal trainers autônomos frequentemente utilizam diferentes ferramentas para administrar e acompanhar seus alunos, como:

* Planilhas;
* Fichas de treino;
* Anotações;
* Aplicativos;
* Registros manuais.

Isso pode resultar em **fragmentação das informações**.

Dados como frequência, peso, cargas, repetições, adesão e desempenho podem permanecer distribuídos em diferentes locais, dificultando:

* A consulta do histórico;
* A visualização da evolução;
* A identificação de mudanças relevantes;
* O acompanhamento individual;
* A priorização de alunos;
* A tomada de decisão baseada em dados.

O problema abordado pelo CoachPass, portanto, não é simplesmente a ausência de dados, mas a dificuldade de **organizar, visualizar e interpretar essas informações de maneira centralizada**.

---

# 💡 Solução

O CoachPass propõe reunir as informações de acompanhamento em uma única plataforma.

```text
┌─────────────────────┐
│       ALUNOS        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│       DADOS         │
│                     │
│ • Treinos           │
│ • Peso              │
│ • Frequência        │
│ • Adesão            │
│ • Cargas            │
│ • Repetições        │
│ • Desempenho        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     COACHPASS       │
│                     │
│ Gestão + Histórico  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      DASHBOARD      │
│                     │
│ • Indicadores       │
│ • Evolução          │
│ • Histórico         │
│ • Alertas           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ INTELIGÊNCIA        │
│ ARTIFICIAL          │
│                     │
│ Análise de padrões  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PERSONAL TRAINER    │
│                     │
│ Decisão profissional│
└─────────────────────┘
```

A proposta pode ser resumida em:

> **Centralizar os dados → organizar as informações → identificar padrões → apoiar decisões.**

---

# 🤖 Inteligência Artificial

A Inteligência Artificial será utilizada como uma **camada de apoio à interpretação dos dados**.

O objetivo não é substituir o personal trainer, gerar automaticamente treinos ou assumir decisões técnicas.

A IA poderá analisar informações registradas no sistema, como:

* Peso;
* Frequência;
* Cargas;
* Repetições;
* Adesão;
* Desempenho;
* Histórico de acompanhamento.

A partir desses dados, o sistema poderá identificar padrões relevantes.

### Exemplo

```text
ANÁLISE DO ALUNO

Frequência:
Redução de 92% para 71% nas últimas 4 semanas.

Registros:
8 dias sem registro de treino.

Desempenho:
Redução nos últimos 3 registros do exercício
analisado.

Ponto de atenção:
Aluno apresenta redução de frequência
e possível queda de desempenho.
```

A informação será apresentada ao personal trainer para que ele realize sua própria avaliação.

```text
DADOS
   ↓
ANÁLISE
   ↓
PADRÃO
   ↓
ALERTA / INSIGHT
   ↓
AVALIAÇÃO PROFISSIONAL
   ↓
DECISÃO
```

> **O CoachPass não substitui a avaliação profissional. Ele fornece informações para que ela seja melhor fundamentada.**

---

# 📊 Dashboards

Os dashboards são responsáveis por transformar os dados registrados em informações visualmente acessíveis.

A plataforma poderá apresentar indicadores relacionados a:

* Evolução dos alunos;
* Frequência;
* Adesão;
* Desempenho;
* Peso;
* Histórico de treinos;
* Pontos de atenção;
* Indicadores gerados pela análise dos dados.

O objetivo é reduzir a necessidade de consultar diferentes registros para compreender a situação de cada aluno.

---

# 👥 Público-alvo

O público principal do MVP são **personal trainers autônomos**.

A solução foi pensada especialmente para profissionais que administram sua própria carteira de alunos e precisam acompanhar diferentes informações de forma organizada.

O foco inicial está na gestão e acompanhamento dessa carteira, evitando ampliar o escopo do MVP para outras categorias profissionais.

---

# 🔐 Privacidade e Segurança

O CoachPass considera a **privacidade e a segurança dos dados** como requisitos importantes desde a concepção da plataforma.

Por trabalhar com informações relacionadas aos alunos, o desenvolvimento considera princípios e requisitos aplicáveis da **Lei Geral de Proteção de Dados Pessoais (LGPD)**.

Entre os aspectos considerados estão:

* Controle de acesso;
* Autenticação;
* Proteção de informações;
* Organização dos dados;
* Segurança no armazenamento;
* Restrição de acesso conforme perfil;
* Princípios de privacidade desde a concepção.

A implementação desses mecanismos será aprimorada ao longo do desenvolvimento e validada durante as etapas de testes do projeto.

---

# 🧩 Principais funcionalidades

## Gestão de usuários

* Cadastro;
* Login;
* Logout;
* Autenticação;
* Gerenciamento de sessão;
* Perfis de usuário;
* Controle de acesso.

## Gestão de alunos

* Cadastro de alunos;
* Edição de informações;
* Listagem;
* Busca;
* Filtros;
* Convites;
* Associação entre personal e aluno.

## Acompanhamento

* Registro de treinos;
* Histórico;
* Peso;
* Frequência;
* Adesão;
* Cargas;
* Repetições;
* Desempenho;
* Evolução.

## Dashboards

* Indicadores;
* Gráficos;
* Histórico;
* Evolução;
* Pontos de atenção;
* Visualização consolidada da carteira.

## Inteligência Artificial

* Análise dos dados registrados;
* Identificação de padrões;
* Detecção de alterações;
* Identificação de períodos sem registros;
* Análise de frequência;
* Análise de desempenho;
* Alertas;
* Insights para apoio à decisão.

---

# 🏗️ Arquitetura conceitual

```text
                 ┌─────────────────┐
                 │    FRONT-END    │
                 │ Next.js / React │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    BACK-END     │
                 │ APIs / Serviços │
                 └───────┬─────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌──────────────┐      ┌──────────────┐
      │  PostgreSQL  │      │      IA      │
      │   Database   │      │   Análise    │
      └──────────────┘      └──────┬───────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │  INSIGHTS   │
                            └──────┬──────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │  DASHBOARD  │
                            └─────────────┘
```

---

# 🛠️ Tecnologias

## Front-end

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **HTML5**
* **CSS3**
* **Lucide Icons**

## Back-end

* **Node.js**
* **Python**
* **APIs REST**
* **Webhooks**

## Banco de dados

* **PostgreSQL**

## Inteligência Artificial

* APIs de modelos de IA;
* Processamento de linguagem natural;
* Extração e estruturação de informações;
* Análise de padrões;
* Geração de indicadores e insights.

## Ferramentas

* **Git**
* **GitHub**
* **Docker**
* **Bash**
* **Cursor**

---

# 🚀 Instalação e execução

## Pré-requisitos

* [Node.js](https://nodejs.org/) v18+
* npm
* Git

## Clone o repositório

```bash
git clone https://github.com/renatobcarv/CoachPass.git
cd CoachPass
```

## Instale as dependências

```bash
npm install
```

## Execute o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

---

# 📅 Roadmap

O desenvolvimento do CoachPass está organizado em **8 sprints**, totalizando **40 entregas**, com execução planejada entre **12/08/2026 e 30/11/2026**.

| Sprint | Período       | Foco                         |
| ------ | ------------- | ---------------------------- |
| **01** | 12/08 → 25/08 | Fundação e Arquitetura       |
| **02** | 26/08 → 08/09 | Autenticação e Usuários      |
| **03** | 09/09 → 22/09 | Gestão da Carteira           |
| **04** | 23/09 → 06/10 | Acompanhamento e Dados       |
| **05** | 07/10 → 20/10 | IA — Processamento e Padrões |
| **06** | 21/10 → 03/11 | IA — Alertas e Insights      |
| **07** | 04/11 → 17/11 | Integração e Experiência     |
| **08** | 18/11 → 30/11 | Testes e Entrega             |

### Status

**6 / 40 entregas concluídas — 15%**

**Sprint 01 — Fundação e Arquitetura:** ✅ Concluída

**Sprint 02 — Autenticação e Usuários:** 🔄 Em andamento

---

# 📚 Fundamentação

O desenvolvimento do CoachPass está fundamentado em estudos relacionados à **digitalização da atividade física, qualidade de dados, visualização de informações, Inteligência Artificial, usabilidade e proteção de dados**.

O crescimento de aplicativos móveis, dispositivos vestíveis e tecnologias orientadas por dados demonstra a expansão da utilização de recursos digitais no setor fitness.

O **American College of Sports Medicine (ACSM)** apontou as tecnologias vestíveis como a principal tendência fitness para 2025, seguidas pelos aplicativos móveis de exercícios. Estudos também demonstram a utilização de aplicativos e dispositivos de monitoramento como ferramentas de apoio à prática de atividade física.

Nesse contexto, o CoachPass busca abordar uma lacuna relacionada não apenas à coleta de dados, mas principalmente à sua **organização, centralização, visualização e interpretação no contexto da gestão de alunos por personal trainers**.

A utilização de dashboards busca facilitar a compreensão das informações, enquanto a Inteligência Artificial será aplicada como mecanismo de apoio à análise, mantendo a avaliação e a decisão sob responsabilidade do profissional.

A plataforma também considera aspectos relacionados à **qualidade dos dados, usabilidade, segurança e privacidade**, incluindo os requisitos aplicáveis da LGPD.

---

# 🔬 Referências

* AMERICAN COLLEGE OF SPORTS MEDICINE. *ACSM announces top fitness trends for 2025*. Indianapolis: ACSM, 2024.

* AUTORIDADE NACIONAL DE PROTEÇÃO DE DADOS. *Guia orientativo sobre segurança da informação para agentes de tratamento de pequeno porte*. Brasília, DF: ANPD, 2021.

* BIRKHOFF, Susan D.; SMELTZER, Suzanne C. Perceptions of smartphone user-centered mobile health tracking apps across various chronic illness populations: an integrative review. *Journal of Nursing Scholarship*, v. 49, n. 4, p. 371-378, 2017.

* BRASIL. Lei nº 13.709, de 14 de agosto de 2018. *Lei Geral de Proteção de Dados Pessoais (LGPD)*. Brasília, DF, 2018.

* CHEN, Hong et al. Methods for assessing the quality of data in public health information systems: a critical review. *Studies in Health Technology and Informatics*, v. 204, p. 13-18, 2014.

* DERGAA, Ismail et al. Using artificial intelligence for exercise prescription in personalised health promotion: a critical evaluation of OpenAI's GPT-4 model. *Biology of Sport*, v. 41, n. 2, p. 221-241, 2024.

* GHALAVAND, Hossein et al. Common data quality elements for health information systems: a systematic review. *BMC Medical Informatics and Decision Making*, v. 24, 2024.

* HE, Jianxing et al. The practical implementation of artificial intelligence technologies in medicine. *Nature Medicine*, v. 25, p. 30-36, 2019.

* LARANJO, Liliana et al. Do smartphone applications and activity trackers increase physical activity in adults? *British Journal of Sports Medicine*, v. 55, n. 8, p. 422-432, 2021.

* LIMA, Claudia Risso de Araujo et al. Revisão das dimensões de qualidade dos dados e métodos aplicados na avaliação dos sistemas de informação em saúde. *Cadernos de Saúde Pública*, v. 25, n. 10, p. 2095-2109, 2009.

* PARK, Seungeun et al. Impact of data visualization on decision-making and its implications for public health practice. *Informatics for Health and Social Care*, v. 47, n. 2, p. 175-193, 2022.

* PRADAL-CANO, Laura et al. Using mobile applications to increase physical activity: a systematic review. *International Journal of Environmental Research and Public Health*, v. 17, n. 21, 2020.

* SILVA, Anabela G. et al. Mobile apps to quantify aspects of physical activity: a systematic review on its reliability and validity. *Journal of Medical Systems*, v. 44, 2020.

* TOPOL, Eric J. High-performance medicine: the convergence of human and artificial intelligence. *Nature Medicine*, v. 25, p. 44-56, 2019.

* WIENS, Jenna et al. Do no harm: a roadmap for responsible machine learning for health care. *Nature Medicine*, v. 25, p. 1337-1340, 2019.

---

# 👥 Equipe

| Função                     | Integrante                       |
| -------------------------- | -------------------------------- |
| **Gerente de Projetos**    | Renato B. Carvalho               |
| **Scrum Master**           | Petter Pablo                     |
| **Analista de Requisitos** | Paulo Christina Bezerra de Souza |
| **Desenvolvedor 1**        | Edson Junior Sousa Queiroz       |
| **Desenvolvedor 2**        | Carlos Eduardo Mendes Farias     |
| **Desenvolvedor de Apoio** | Gustavo Miranda Moreira da Silva |

---

# 🎓 Sobre o projeto

O CoachPass é desenvolvido como um projeto de aplicação prática de conhecimentos relacionados a:

* Desenvolvimento web;
* Engenharia de software;
* Banco de dados;
* APIs;
* Inteligência Artificial;
* Análise e visualização de dados;
* Segurança da informação;
* Privacidade e proteção de dados;
* Experiência do usuário.

O desenvolvimento e a validação do MVP permitirão avaliar a viabilidade da proposta e sua capacidade de atender às necessidades identificadas junto ao público-alvo.

---

<div align="center">

# CoachPass

**Gestão, acompanhamento e análise de dados para personal trainers.**

*Centralizar informações. Identificar padrões. Apoiar decisões.*

</div>
