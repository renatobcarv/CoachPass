# CoachPass

> **Seu aluno conversa. A IA registra. Você acompanha.**

O **CoachPass** é uma plataforma SaaS de gestão para personal trainers que conecta **profissional, aluno, WhatsApp e Inteligência Artificial** em um único fluxo de acompanhamento.

A proposta é eliminar a necessidade de o aluno ficar alternando entre WhatsApp, planilhas e plataformas diferentes para registrar informações. O aluno continua utilizando o **WhatsApp**, enquanto a IA interpreta suas mensagens, identifica informações relevantes e transforma esses dados em registros estruturados no CoachPass.

O personal trainer acompanha tudo através de um **dashboard centralizado**, com dados de evolução, adesão, desempenho e insights gerados a partir do histórico dos alunos.

---

## 🎯 Problema

Personal trainers autônomos frequentemente utilizam uma combinação de:

* WhatsApp;
* Planilhas;
* Anotações;
* Aplicativos diferentes;
* Registros manuais.

O problema não é a falta de informação, mas a **fragmentação dos dados**.

O aluno conversa pelo WhatsApp, mas informações importantes ficam espalhadas pela conversa. O profissional precisa recuperar esses dados manualmente, atualizar planilhas e acompanhar diversos alunos individualmente.

Além disso, exigir que o aluno entre constantemente em uma plataforma para registrar cada informação pode reduzir a adesão ao acompanhamento.

---

## 💡 Solução

O CoachPass utiliza a **IA como ponte entre o aluno e o sistema de gestão**.

O aluno continua utilizando o WhatsApp para interagir e fornecer informações. A IA interpreta essas mensagens e transforma os dados relevantes em informações estruturadas para o acompanhamento profissional.

```text
ALUNO
  │
  │ WhatsApp
  ▼
IA / ASSISTENTE
  │
  │ Interpretação
  ▼
PROCESSAMENTO
  │
  ├── Dados do treino
  ├── Peso
  ├── Desempenho
  ├── Frequência
  └── Adesão
  │
  ▼
COACHPASS
  │
  ▼
DASHBOARD
  │
  ├── Evolução
  ├── Histórico
  ├── Indicadores
  ├── Alertas
  └── Insights
  │
  ▼
PERSONAL TRAINER
```

---

# 🤖 Inteligência Artificial

A IA do CoachPass não tem como objetivo substituir o personal trainer ou gerar automaticamente treinos e dietas.

Ela funciona como uma **camada de interpretação e apoio à decisão**.

### Exemplo

O aluno envia:

> "Hoje fiz peito e tríceps. No supino fiz 80kg para 10 repetições."

A IA pode interpretar:

```text
Treino: Peito + Tríceps
Exercício: Supino
Carga: 80 kg
Repetições: 10
Data: 12/08/2026
```

Essas informações poderão ser armazenadas automaticamente no histórico do aluno.

A IA também poderá analisar os dados acumulados e identificar padrões.

### Exemplo de insight

```text
INSIGHT

João manteve 87% de adesão nas últimas 3 semanas.

A frequência permanece estável, porém houve
queda de desempenho no supino nos últimos
2 registros.

Recomenda-se atenção no próximo acompanhamento.
```

A decisão final permanece com o profissional.

---

# 📱 WhatsApp

O WhatsApp será utilizado como **canal de interação com o aluno**, aproveitando uma ferramenta que já faz parte da rotina dos profissionais e seus clientes.

A ideia não é substituir o WhatsApp, mas conectar o WhatsApp ao sistema de gestão.

### Fluxo planejado

```text
Aluno envia mensagem
        ↓
WhatsApp
        ↓
WhatsApp Business API
        ↓
Webhook
        ↓
Backend
        ↓
IA
        ↓
Extração de informações
        ↓
Banco de dados
        ↓
Dashboard do Personal
```

Dessa forma, o aluno não precisa ficar voltando para uma planilha ou preenchendo manualmente diversos campos para que o profissional tenha acesso às informações.

> **O WhatsApp é o canal. O CoachPass é o sistema de gestão.**

---

# 🚀 Funcionalidades planejadas

## 👨‍💼 Gestão do Personal

* [ ] Cadastro e autenticação
* [ ] Dashboard
* [ ] Gestão da carteira de alunos
* [ ] Cadastro de alunos
* [ ] Indicadores gerais
* [ ] Visualização individual dos alunos

## 👤 Gestão do Aluno

* [ ] Cadastro
* [ ] Perfil individual
* [ ] Vínculo com personal
* [ ] Histórico de acompanhamento
* [ ] Dados de evolução
* [ ] Registro de treinos
* [ ] Indicadores de adesão

## 💬 WhatsApp

* [ ] Integração com WhatsApp Business API
* [ ] Recebimento de mensagens
* [ ] Envio de mensagens
* [ ] Webhooks
* [ ] Fluxos automatizados de acompanhamento

## 🤖 Inteligência Artificial

* [ ] Interpretação de mensagens
* [ ] Extração de informações
* [ ] Estruturação automática dos dados
* [ ] Identificação de padrões
* [ ] Análise de adesão
* [ ] Análise de desempenho
* [ ] Geração de insights
* [ ] Identificação de pontos de atenção

## 📊 Dashboard

* [ ] Evolução de peso
* [ ] Frequência
* [ ] Adesão
* [ ] Desempenho
* [ ] Histórico
* [ ] Gráficos
* [ ] Indicadores da carteira
* [ ] Alertas
* [ ] Insights gerados pela IA

---

# 🛠️ Stack

## Front-end

* **Next.js**
* **React**
* **TypeScript**
* **JavaScript**
* **Tailwind CSS**
* **HTML5**
* **CSS3**

## Back-end

* **Python**
* **APIs REST**
* **Webhooks**
* **Next.js API**
* Integração com serviços externos

## Inteligência Artificial

* **Python**
* APIs de modelos de IA
* Processamento de linguagem natural
* Extração e estruturação de dados
* Análise de padrões

## Integrações

* **WhatsApp Business Platform / API**
* APIs externas
* Webhooks

---

# 🏗️ Arquitetura planejada

```text
                         ┌─────────────────┐
                         │      ALUNO      │
                         └────────┬────────┘
                                  │
                              WhatsApp
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  WhatsApp API   │
                         └────────┬────────┘
                                  │
                               Webhook
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    BACKEND      │
                         │  Python / API   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │       IA        │
                         │     Python      │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             Dados estruturados            Insights
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                         ┌─────────────────┐
                         │    DATABASE     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    COACHPASS    │
                         │    NEXT.JS      │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     PERSONAL    │
                         └─────────────────┘
```

---

# 📁 Estrutura planejada

```text
CoachPass/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   └── controllers/
│
├── ai/
│   ├── processing/
│   ├── analysis/
│   └── models/
│
├── docs/
│   ├── arquitetura.md
│   ├── requisitos.md
│   └── banco-de-dados.md
│
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

> A estrutura poderá ser modificada conforme a arquitetura evoluir durante o desenvolvimento.

---

# 🔄 Fluxo principal

```text
1. Personal cadastra o aluno
              ↓
2. Aluno é vinculado ao profissional
              ↓
3. Aluno interage pelo WhatsApp
              ↓
4. IA interpreta as mensagens
              ↓
5. Informações relevantes são extraídas
              ↓
6. Dados são estruturados e armazenados
              ↓
7. CoachPass atualiza o histórico
              ↓
8. Personal acompanha pelo dashboard
              ↓
9. IA analisa padrões e gera insights
              ↓
10. Personal toma a decisão profissional
```

---

# 🎯 Público-alvo

## Público primário

**Personal trainers autônomos** com aproximadamente 15 a 40 alunos que atualmente utilizam WhatsApp, planilhas e processos manuais para administrar sua carteira.

## Público secundário

**Alunos**, que participam da plataforma principalmente através do vínculo com seu personal trainer.

## Expansão futura

**Nutricionistas**, permitindo conectar posteriormente acompanhamento de treino e alimentação.

---

# 📌 MVP

O MVP terá como foco principal o **personal trainer autônomo**.

O objetivo inicial é validar o fluxo:

```text
Aluno
  ↓
WhatsApp
  ↓
IA
  ↓
Dados
  ↓
CoachPass
  ↓
Dashboard
  ↓
Personal
```

### MVP inicial

* [ ] Autenticação
* [ ] Cadastro de personal
* [ ] Cadastro de alunos
* [ ] Sistema de convite
* [ ] Vínculo personal ↔ aluno
* [ ] Dashboard
* [ ] Perfil do aluno
* [ ] Registro de peso
* [ ] Registro de treinos
* [ ] Registro de desempenho
* [ ] Registro de adesão
* [ ] Histórico
* [ ] Gráficos
* [ ] API
* [ ] Banco de dados
* [ ] Integração inicial com IA
* [ ] Integração inicial com WhatsApp

---

# 🛣️ Roadmap

### Fase 1 — Fundação

* [ ] Definição da arquitetura
* [ ] Configuração do Next.js
* [ ] Configuração do TypeScript
* [ ] Configuração do Tailwind CSS
* [ ] Estrutura do backend
* [ ] Banco de dados
* [ ] APIs

### Fase 2 — Gestão

* [ ] Autenticação
* [ ] Cadastro de profissionais
* [ ] Cadastro de alunos
* [ ] Sistema de vínculo
* [ ] Dashboard
* [ ] Perfil do aluno

### Fase 3 — Acompanhamento

* [ ] Registro de treinos
* [ ] Peso
* [ ] Desempenho
* [ ] Frequência
* [ ] Adesão
* [ ] Histórico
* [ ] Gráficos

### Fase 4 — IA

* [ ] Processamento de mensagens
* [ ] Extração de informações
* [ ] Estruturação automática dos dados
* [ ] Análise de padrões
* [ ] Insights
* [ ] Alertas

### Fase 5 — WhatsApp

* [ ] Configuração da API
* [ ] Webhooks
* [ ] Recebimento de mensagens
* [ ] Processamento por IA
* [ ] Respostas automatizadas
* [ ] Fluxos de acompanhamento

### Fase 6 — Expansão

* [ ] Relatórios
* [ ] Notificações
* [ ] Métricas avançadas
* [ ] Aplicativo mobile
* [ ] Integração com nutricionistas
* [ ] Novas integrações

---

# 🔐 Segurança

O projeto deverá considerar:

* Autenticação segura
* Controle de acesso
* Validação de dados
* Proteção das APIs
* Variáveis de ambiente
* Proteção de credenciais
* Segurança dos webhooks
* Controle de acesso aos dados dos alunos
* Armazenamento adequado das informações

**Tokens, senhas, chaves de API e credenciais nunca devem ser enviados ao GitHub.**

---

# 💻 Instalação

## Pré-requisitos

* [Node.js](https://nodejs.org/)
* npm ou Yarn
* [Python 3](https://www.python.org/)
* [Git](https://git-scm.com/)

## Clone o projeto

```bash
git clone https://github.com/renatobcarv/CoachPass.git
cd CoachPass
```

## Instale as dependências

```bash
npm install
```

## Execute o projeto

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

---

# 🔑 Variáveis de ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=

DATABASE_URL=

AUTH_SECRET=

AI_API_KEY=

WHATSAPP_ACCESS_TOKEN=

WHATSAPP_PHONE_NUMBER_ID=

WHATSAPP_VERIFY_TOKEN=
```

> Utilize `.env.example` para documentar as variáveis necessárias sem expor credenciais reais.

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

# 📚 Metodologia

O desenvolvimento do CoachPass será organizado utilizando **Scrum**, com:

* Product Backlog
* Sprints
* Daily Scrum
* Sprint Review
* Sprint Retrospective
* Priorização de funcionalidades
* Desenvolvimento incremental

---

# 🎓 Projeto acadêmico

O CoachPass está sendo desenvolvido como projeto acadêmico, aplicando conhecimentos de:

* Engenharia de Software
* Desenvolvimento Web
* Desenvolvimento de APIs
* Banco de Dados
* Inteligência Artificial
* Desenvolvimento Ágil
* Scrum
* UX/UI
* Arquitetura de Software

---

# 🚧 Status

**Em desenvolvimento**

O projeto encontra-se em fase de construção e validação do MVP.

---

# 📄 Licença

Este projeto é desenvolvido para fins acadêmicos.

---

<div align="center">

## CoachPass

**Seu aluno conversa. A IA registra. Você acompanha.**

</div>
