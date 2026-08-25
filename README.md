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

# 🛠️ Stack

## Front-end
* **Next.js 16 (App Router)**
* **React 19**
* **TypeScript**
* **Tailwind CSS v4**
* **Lucide Icons**

## Back-end & IA (Planejados)
* **Python**
* **APIs REST / Webhooks**
* APIs de modelos de IA (Processamento de linguagem natural & extração de dados)

---

# 💻 Instalação e Execução

## Pré-requisitos
* [Node.js](https://nodejs.org/) (v18+)
* npm

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

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

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

<div align="center">

## CoachPass

**Seu aluno conversa. A IA registra. Você acompanha.**

</div>
