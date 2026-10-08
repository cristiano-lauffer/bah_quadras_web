# Status Report da Sprint 2

## 1. Identificação

- **Projeto:** Bah Quadras
- **Número da Sprint:** 2
- **Período:** 24/07 a 8/10
- **Integrantes:** Gabriel Daudt, Nicolas Miotto, Cristiano Lauffer, Gabrieli Morales e Thiago Figueiredo
- **Scrum Master da Sprint:** Gabriel Daudt

### Meta da Sprint

**Meta:**

Implementar a autenticação do sistema, permitindo que clientes se cadastrem e façam login. Estabelecer a estrutura inicial do banco de dados e integrar o frontend com a API.
Definição do escopo do projeto.
Refinamento das primeiras US.

---

## 2. Resultado da Sprint

### Situação da meta

- [x] Alcançada
- [ ] Parcialmente alcançada
- [ ] Não alcançada

### Resultado alcançado

**Resultado:**

A estrutura inicial do banco de dados foi criada, com a tabela `usuarios` suportando os três papéis do sistema (cliente, empresa e admin), índice de unicidade no e-mail e seed com o usuário admin inicial.

A API REST foi implementada do zero com Node.js e Express, entregando os endpoints `POST /auth/register` e `POST /auth/login`, middleware JWT para autenticação e controle de acesso por papel, e conexão com o MySQL via Knex.

No frontend, as telas de login e cadastro foram integradas à API. Foi implementado o `AuthContext` para gerenciamento global de sessão, o serviço Axios com injeção automática do token JWT, e o sistema de rotas privadas e públicas com redirecionamento por papel do usuário.

---

## 3. Itens planejados e situação final

| User Story ou item | Responsável(is) | Situação final | Observação |
|---|---|---|---|
| US1 – Cliente cria conta e faz login | BACK + FRONT-A | Concluído | Critérios de aceite verificados |
| US2 – Empresa faz login e acessa dashboard | BACK + FRONT-B | Em andamento | Aguarda merge da US1 |
| US3 – Admin cria conta de empresa | BACK | Em andamento | Endpoint implementado; sem tela (via Postman no MVP) |
| Estrutura inicial do banco de dados | DB1 | Concluído | Tabela `usuarios` criada com seed do admin |
| Esqueleto da API (Express, Knex, .env) | BACK | Concluído | Estrutura de pastas, conexão e middlewares prontos |
| Criar Telas Padrão | FRONT | Concluido | Conceito inicial das telas |

---

## 4. Evidências e qualidade

### Evidências

- **Repositório Web:** https://github.com/cristiano-lauffer/bah_quadras_web
- **Repositório API:** https://github.com/cristiano-lauffer/bah_quadras_api
- **Repositório DB:** https://github.com/cristiano-lauffer/bah_quadras_db
- **Quadro Kanban:** https://github.com/cristiano-lauffer/bah_quadras_web/projects
- **Figma:** https://www.figma.com/board/j3QTg3fSG8msEkMvMJOoYA/Bah-Quadras?node-id=0-1&p=f
- **Deploy ou instruções para executar o projeto:** instruções disponíveis no README de cada repositório

### Checklist de qualidade

- [x] Os itens marcados como concluídos atendem aos critérios de aceite.
- [x] As funcionalidades entregues foram testadas pela equipe.
- [x] O código atualizado está no repositório oficial.
- [x] Os problemas conhecidos estão registrados no Kanban ou no repositório.

### Problemas conhecidos

**Registro:**

A US2 (empresa acessa dashboard) e a US3 (admin cria empresa via tela) não foram iniciadas pois dependem do merge da US1. O endpoint de criação de empresa pelo admin está funcional mas acessível apenas via Postman, sem interface no MVP desta sprint.

---

## 5. Retrospectiva da Sprint

### Manter

**Registro:**

A divisão clara de responsabilidades entre frontend, backend e banco de dados evitou conflitos no repositório e permitiu que cada pessoa trabalhasse de forma independente. O uso do GitHub Projects para acompanhamento das tarefas facilitou a visibilidade do progresso do time.

### Agir

**Ação:**

No início da Sprint 3, o time vai dedicar a primeira reunião para fechar o modelo ER das tabelas restantes (`quadras`, `horarios`, `reservas`) e o contrato dos endpoints antes de qualquer linha de código.

Alinhamento com duas empresas parceiras para validação e uso inicial da aplicação.

## 6. Planejamento da próxima Sprint

### Meta da próxima Sprint

**Meta:**

Permitir que a empresa cadastre e gerencie suas quadras e horários disponíveis pelo dashboard.

### Itens inicialmente selecionados

| User Story ou item | Responsável(is) | Resultado esperado |
|---|---|---|
| Merge e validação da US1 | Todo o time | Branch `feature/US1-auth` aprovada e integrada na `develop` |
| US2 – Empresa faz login e acessa dashboard | BACK + FRONT-B | Login da empresa redirecionando para o painel |
| US4 – Empresa cadastra, edita e desativa quadras | BACK + FRONT-B + DB1 | CRUD de quadras funcionando com validação de ownership |
| US5 – Empresa define horários disponíveis | BACK + FRONT-B + DB1 | Grade de horários por quadra com bloqueio de double booking |
| Fechar modelo ER (quadras, horarios, reservas) | DB1 + DB2 | Migrations criadas e documentadas |

### Riscos ou impedimentos previstos

**Riscos:**

A regra de anti double booking na tabela de horários é tecnicamente crítica e pode demandar mais tempo do que o estimado. Se houver dificuldade, a grade de horários pode ser simplificada para o MVP utilizando slots fixos por dia da semana em vez de datas dinâmicas.
