# CoachPass — diagrama de classes

O que está marcado como persistido já existe no Postgres. Fora do MVP: financeiro, alimentos TACO, check-in de treino e dieta por IA.

```mermaid
classDiagram
  class User {
    <<persistido>>
    +id
    +email
    +name
    +role
    +isSuperAdmin
    +whatsapp
    +professionalId
    +bio
    +specialties
    +avatarUrl
    +city
    +consentAcceptedAt
    +plan
    +createdAt
    +updatedAt
    +login()
    +logout()
  }

  class Session {
    <<persistido>>
    +id
    +createdAt
    +expiresAt
  }

  class Media {
    <<persistido>>
    +id
    +alt
    +url
    +filename
    +mimeType
  }

  class Aluno {
    +verTreinoDoDia()
    +marcarExercicio()
    +verDieta()
    +registrarAgua()
  }

  class Personal {
    +convidarAluno()
    +criarTreino()
    +avaliar()
    +agendarSessao()
  }

  class Nutricionista {
    +convidarPaciente()
    +criarPlanoAlimentar()
    +registrarConsulta()
    +preencherAnamnese()
  }

  class Master {
    +abrirTodosOsPaineis()
  }

  class Treino {
    +nome
    +dia
  }

  class Exercicio {
    +nome
    +series
    +reps
    +carga
    +feito
  }

  class Avaliacao {
    <<persistido assessments>>
    +peso
    +medidas
    +parq
  }

  class SessaoAgendada {
    <<persistido sessions>>
    +data
    +horario
    +status
  }

  class PlanoAlimentar {
    +calorias
    +refeicoes
  }

  class Consulta {
    +peso
    +adesao
    +observacoes
  }

  class Anamnese {
    <<persistido anamneses>>
    +saude
    +alimentar
    +objetivos
  }

  class Restricao {
    <<persistido restrictions>>
    +tipo
    +severidade
    +ativa
  }

  User "1" --> "*" Session : sessoes
  User <|-- Aluno
  User <|-- Personal
  User <|-- Nutricionista
  User <|-- Master

  Personal "1" --> "*" Aluno : acompanha
  Nutricionista "1" --> "*" Aluno : acompanha
  Personal "1" --> "*" Treino
  Treino "1" --> "*" Exercicio
  Personal "1" --> "*" Avaliacao
  Personal "1" --> "*" SessaoAgendada
  Personal "1" --> "*" Restricao
  Nutricionista "1" --> "*" PlanoAlimentar
  Nutricionista "1" --> "*" Consulta
  Nutricionista "1" --> "*" Anamnese
  Aluno "1" --> "*" Treino : executa
  Aluno "1" --> "*" PlanoAlimentar : segue
```

Papéis em `User.role`: `student`, `personal`, `nutritionist`, `master`.

Fora do recorte: questionários, metas, periodização, materno-infantil, cursos e canvas.
