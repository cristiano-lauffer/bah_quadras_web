# bah_quadras_web

Front-end do Bah Quadras (React + Vite).

## Rodando com a API

Os três repositórios ficam lado a lado: `bah_quadras_db`, `bah_quadras_api` e `bah_quadras_web`.

1. **Banco:** `mysql -u root -p < ../bah_quadras_db/bah_quadras_reset_completo.sql` (apaga e recria o banco `bah_quadras`)
2. **API:** em `../bah_quadras_api`, `cp .env.example .env`, `npm install` e `npm run dev` (sobe em `http://localhost:3000`)
3. **Front:** aqui, `npm install` e `npm run dev` (abre em `http://localhost:5173`)

Se a API rodar em outro endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

### Contas de desenvolvimento (criadas pelo seed do banco)

| Conta | E-mail | Senha |
|---|---|---|
| Empresa (Arena Central) | contato@arenacentral.com | empresa123 |
| Jogador | joao@arena.local | cliente123 |

Jogadores também podem criar conta em "Criar conta". Empresas não se cadastram pelo site: o admin cria a conta pela API (`POST /admin/empresas`, veja o Postman da API). A conta de admin não tem painel no site.

## O que já usa a API

| Parte do site | Rotas da API |
|---|---|
| Login, cadastro de jogador e sessão (token) | `POST /auth/login`, `POST /auth/register` |
| Minhas quadras: cadastrar, editar, preço, situação (US4, US6) | `/quadras`, `/tipos-quadra` |
| Horários da quadra (US5) | `/quadras/:id/horarios` |
| Home, detalhes da quadra e horários livres no agendamento | `GET /publico/quadras`, `GET /publico/quadras/:id` |

Todas as chamadas passam por `src/services/api.js`, que envia o token de quem está logado e volta para o login se o token expirar. As telas não chamam a API direto: usam os arquivos de `src/services/`.

## O que ainda é demonstração (salvo no navegador)

Ainda não existe rota na API para estas partes, então elas continuam com dados de exemplo no `localStorage`:

- reservas do jogador e da empresa (a reserva feita no agendamento fica só no navegador);
- dashboard, financeiro e notificações da empresa;
- perfil da empresa (endereço, contatos, horário de funcionamento, política de cancelamento): o nome da empresa e o responsável já vêm da conta;
- avaliações, favoritos, "Meus dados" do jogador e recuperação de senha;
- envio de foto própria da quadra (a API guarda só o endereço de uma imagem, então o formulário oferece as fotos sugeridas).

A Home mostra as quadras da API junto com as quadras de demonstração de `src/data/quadras.js`.

## Scripts

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: build de produção em `dist/`
- `npm run preview`: serve o build em `http://localhost:4173` (a API já libera essa origem no CORS)
- `npm run lint`: Oxlint
