 # MyPetFound

Aplicação web comunitária para cadastrar animais, divulgar desaparecimentos, receber avistamentos e ajudar a devolver animais encontrados aos seus tutores. O backend também oferece uma identificação pública por QR Code e mensagens privadas para o tutor.

## Funcionalidades

- Cadastro e gerenciamento privado de animais, incluindo foto.
- Anúncios públicos de animais com ocorrência ativa de desaparecimento, busca e mapa.
- Registro público de avistamentos associado à ocorrência ativa correspondente.
- Identificação pública por QR Code e envio de mensagem ao tutor.
- Caixa privada de mensagens e histórico privado de ocorrências/avistamentos por animal.
- Compartilhamento do anúncio público pelo Web Share ou WhatsApp.

## Arquitetura e estrutura

- `frontend/`: React 19, Vite, React Router, Axios e React Leaflet.
- `backend/`: Django REST Framework, autenticação por token e apps de domínio.
- `backend/apps/animais/`: animais, anúncios públicos, QR Code e histórico.
- `backend/apps/ocorrencias/`: desaparecimentos e encerramento como reencontrado.
- `backend/apps/avistamentos/`: relatos públicos e consultas privadas do tutor.
- `backend/apps/comunicacoes/`: mensagens públicas direcionadas pelo animal e caixa privada.
- `backend/apps/usuarios/`: cadastro, login e perfil do usuário padrão do Django.
- `docker-compose.yml`: PostgreSQL e backend; o frontend é executado localmente.
- `docker/backend/Dockerfile`: imagem do backend.

O frontend usa `frontend/src/services/api.js` como cliente Axios central. As rotas de tutor usam `RotaProtegida`; o backend repete a autorização com `IsAuthenticated` e querysets limitados ao tutor. O usuário é o `User` padrão do Django.

## Pré-requisitos

- Python e pip compatíveis com as dependências de `backend/requirements.txt`.
- Node.js e npm compatíveis com `frontend/package-lock.json`.
- PostgreSQL acessível localmente, ou Docker com Docker Compose para iniciar os serviços definidos no Compose.

Não há versão mínima de Node ou Python declarada pelo projeto para execução local. A imagem do backend usa Python 3.13.

## Execução local

### Backend

Na raiz, crie/ative um ambiente virtual e instale as dependências:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Configure no ambiente as variáveis de banco descritas em [Variáveis de ambiente](#variáveis-de-ambiente). Para um backend executado no host, `POSTGRES_HOST` deve apontar ao PostgreSQL local (por exemplo, `127.0.0.1`); `db` é o nome de serviço usado dentro do Compose. Ative `DJANGO_DEBUG=True` no desenvolvimento local para o Django servir `/media/`.

```sh
cd backend
python manage.py migrate
python manage.py runserver
```

O backend fica em `http://localhost:8000`; a API fica sob `/api/v1/`.

### Frontend

Em outro terminal:

```sh
cd frontend
npm ci
npm run dev
```

O Vite usa `http://localhost:5173`. Para desenvolvimento local sem proxy, o valor em `frontend/.env` é `VITE_API_URL=http://localhost:8000/api/v1`; configure também `VITE_PUBLIC_URL` se precisar fixar a origem pública do frontend. O código remove barras finais da URL base e ignora como inválida uma configuração que contenha `.env` no caminho. Variáveis que o Vite entrega ao navegador devem usar o prefixo `VITE_` e não devem conter segredos. Reinicie o Vite após alterar arquivos `.env`.

Não há proxy configurado em `frontend/vite.config.js`, e o Compose não executa o frontend. Assim, o navegador usa a porta publicada do backend (`localhost:8000`), não o hostname interno `backend` do Compose. Se o frontend for colocado atrás de um proxy reverso, configure `VITE_API_URL=/api/v1` somente quando esse proxy encaminhar esse caminho ao backend. URLs relativas de fotos são resolvidas contra a origem da API, sem acrescentar `/api/v1`.

### Docker Compose

O Compose define os serviços `db` (PostgreSQL 16) e `backend`. Crie um `.env` usando `.env.example` como referência e substitua os placeholders por valores locais:

```sh
docker compose up --build -d db backend
docker compose exec backend python manage.py migrate
```

Execute o frontend no host conforme as instruções acima. O banco usa o volume nomeado `postgres_data`. O backend monta `./backend` em `/app`, de modo que uploads em `backend/media/` permanecem na cópia local enquanto esse bind mount for usado. O Compose não define serviço para o frontend.

## Variáveis de ambiente

Configurações lidas pelo backend (`backend/config/settings.py`):

| Variável | Uso | Padrão no código |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Chave Django; configure uma chave própria fora do desenvolvimento | Chave de desenvolvimento explícita |
| `DJANGO_DEBUG` | Habilita modo debug e serviço de mídia pelo Django | `False` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos, separados por vírgula | `localhost,127.0.0.1` |
| `POSTGRES_DB` | Banco PostgreSQL | `pet_encontrado` |
| `POSTGRES_USER` | Usuário PostgreSQL | Conforme ambiente local/Compose |
| `POSTGRES_PASSWORD` | Senha PostgreSQL | Conforme ambiente local/Compose |
| `POSTGRES_HOST` | Host PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Porta PostgreSQL | `5432` |
| `FRONTEND_URL` | Origem pública do frontend usada nos links de QR Code e recuperação de senha. **Em produção, deve ser a URL completa do frontend (ex.: `https://mypetfound.exemplo.com`), sem `/api` nem caminho adicional. A barra final é normalizada automaticamente.** | `http://localhost:5173` |
| `EMAIL_HOST` | Host SMTP; vazio seleciona o envio em console | Vazio |
| `EMAIL_PORT` | Porta SMTP | `587` |
| `EMAIL_HOST_USER` | Usuário SMTP | Vazio |
| `EMAIL_HOST_PASSWORD` | Credencial SMTP, somente no `.env` local | Vazio |
| `EMAIL_USE_TLS` | Ativa TLS no SMTP (desativado automaticamente se SSL estiver ativo) | `True` |
| `EMAIL_USE_SSL` | Ativa SSL no SMTP | `False` |
| `DEFAULT_FROM_EMAIL` | Remetente das mensagens | `nao-responda@mypetfound.local` |

O Compose injeta as variáveis do `.env` e define o host do banco como `db` para o backend no contêiner. O frontend aceita `VITE_API_URL` e `VITE_PUBLIC_URL`; ambas são variáveis opcionais de build/desenvolvimento, sem valor versionado no repositório.

### Recuperação de senha e e-mail

Sem `EMAIL_HOST`, o desenvolvimento local usa o `ConsoleEmailBackend`; os e-mails de recuperação e links temporários aparecem nos logs do backend:

```sh
docker compose logs -f backend
```

Para enviar por SMTP, defina `EMAIL_HOST` e as demais variáveis no `.env` local. Com o host preenchido, o Django seleciona automaticamente o backend SMTP. Exemplo de configuração:

```env
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.seu-provedor.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu-email@exemplo.com
EMAIL_HOST_PASSWORD=sua-credencial-secreta
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL="MyPetFound <seu-email@exemplo.com>"
```

Nunca versione o `.env` nem credenciais SMTP. Use a credencial apropriada do provedor; se um provedor exigir senha de aplicativo, mantenha-a somente no arquivo local ignorado pelo Git.

## Migrações e mídia

Execute `python manage.py migrate` dentro de `backend/` após configurar o banco. `Animal.foto` é um `ImageField` salvo em `MEDIA_ROOT/animais/AAAA/MM/`; fotos de avistamentos ficam em `avistamentos/AAAA/MM/`. `MEDIA_URL` é `/media/`. Os serializers privado e público retornam URLs de foto absolutas quando há request disponível.

No desenvolvimento (`DJANGO_DEBUG=True`), `config/urls.py` serve mídia em `/media/`. Essa rota não é habilitada pelo projeto em produção; nesse ambiente, um servidor de mídia configurado para apontar a `MEDIA_ROOT` deve servir os arquivos. Fotos ausentes continuam opcionais.

## Rotas do frontend

Públicas:

- `/` — página inicial e anúncios ativos.
- `/buscar` — busca pública.
- `/animais/:id` — detalhes públicos e compartilhamento do anúncio.
- `/mapa` — mapa público.
- `/identificacao/:codigo` — identificação aberta pelo QR e envio de mensagem.
- `/entrar` e `/cadastro` — login e cadastro.

Protegidas por token:

- `/meus-animais`, `/meus-animais/novo` — lista e cadastro do tutor.
- `/meus-animais/:id` — gerenciamento.
- `/meus-animais/:id/editar` — edição do animal.
- `/meus-animais/:id/desaparecimento` — novo desaparecimento.
- `/meus-animais/:id/historico` — histórico privado por animal (inclui evento de reencontro).
- `/mensagens` — mensagens privadas recebidas (badge de não lidas no cabeçalho).

## Endpoints principais da API

Todos usam o prefixo `/api/v1/`.

| Método e rota | Acesso e função |
| --- | --- |
| `POST auth/cadastro/` | Público; cria usuário e retorna token |
| `POST auth/login/` | Público; login DRF TokenAuthentication |
| `GET auth/me/` | Token; perfil do usuário autenticado |
| `GET, POST animais/` | Token; lista/cadastra os animais do tutor |
| `GET, PATCH, DELETE animais/:id/` | Token; operações limitadas ao proprietário |
| `GET animais/:id/historico/` | Token; histórico de propriedade |
| `GET animais/:id/qrcode/` | Token; gera PNG do QR somente para o tutor proprietário |
| `GET publico/animais-perdidos/` | Público; anúncios com desaparecimento ativo |
| `GET publico/animais-perdidos/:id/` | Público; detalhe do anúncio ativo |
| `GET publico/identificacao/:codigo/` | Público; dados básicos associados ao código assinado do QR |
| `POST animais/:id/mensagens/` | Público; cria mensagem para o tutor do animal no caminho |
| `GET ocorrencias/?animal=:id` | Token; consulta ocorrências dos animais do tutor |
| `POST ocorrencias/` | Token; registra ocorrência de desaparecimento para animal próprio |
| `POST ocorrencias/:id/marcar-reencontrado/` | Token; encerra ocorrência própria e atualiza o estado do animal |
| `POST publico/avistamentos/` | Público; cria avistamento para a ocorrência ativa mais recente do animal |
| `GET avistamentos/?animal=:id` | Token; consulta avistamentos de animal do tutor |
| `GET comunicacoes/mensagens/` | Token; lista mensagens recebidas pelo tutor |
| `PATCH comunicacoes/mensagens/:id/ler/` | Token; marca mensagem própria como lida |
| `GET comunicacoes/mensagens/nao-lidas/contar/` | Token; retorna contagem de mensagens não lidas do tutor |

As fotos de animal e avistamento são enviadas como `multipart/form-data`. `TokenAuthentication` usa o cabeçalho `Authorization: Token …`; no navegador, o token fica em `localStorage` sob `mypetfound_token`. Cadastro e login mantêm os contratos próprios existentes.

### QR Code, identificação e mensagens

O endpoint privado (`GET /api/v1/animais/:id/qrcode/`) gera um PNG do QR Code contendo a URL pública de identificação: `{FRONTEND_URL}/identificacao/:codigo`. O código `:codigo` é assinado pelo Django (`signing.dumps`) e só pode ser resolvido pelo backend.

A página pública `/identificacao/:codigo`:
- Chama `GET /api/v1/publico/identificacao/:codigo/` para validar o código e obter dados básicos do animal.
- Exibe foto, nome, espécie, raça, porte, cor, sexo e status.
- Se o animal **não** estiver `REENCONTRADO`, mostra o formulário de mensagem ao tutor.
- Se o animal estiver `REENCONTRADO`, exibe a mensagem "Animal reencontrado" e não aceita novas mensagens.

**Configuração obrigatória para QR Codes funcionarem em produção:**
- Defina `FRONTEND_URL` como a **origem pública do frontend** (ex.: `https://app.mypetfound.org`), **sem `/api` e sem caminho adicional**. A barra final é removida automaticamente.
- O frontend deve expor a rota `/identificacao/:codigo` (já configurada no `App.jsx`).
- QR Codes gerados com `localhost` só abrem no próprio dispositivo; para leitura por terceiros, o frontend precisa ser acessível na rede/Internet.

O formulário de mensagem (`POST /api/v1/animais/:id/mensagens/`) é público; o destinatário vem do animal identificado — o visitante não escolhe tutor. Mensagens criadas ficam `lida=false` até o tutor marcá-las como lidas na área privada.

### Compartilhamento e histórico

Na página pública `/animais/:id`, o compartilhamento apresenta nome, espécie, raça/cor/porte quando disponíveis, localidade e URL pública. O Web Share e o link do WhatsApp só abrem após ação da pessoa. Sem `VITE_PUBLIC_URL`, a URL usa a origem atualmente aberta: em desenvolvimento, ela normalmente será localhost e não estará acessível a outras pessoas.

O histórico privado (`GET /api/v1/animais/:id/historico/`) agrega eventos cronológicos:
- **Cadastro**: quando o animal foi cadastrado.
- **Desaparecimento/Reencontro**: ocorrências registradas pelo tutor.
- **Avistamentos**: relatos públicos vinculados à ocorrência ativa correspondente.
- **Reencontro**: quando o tutor marca uma ocorrência de desaparecimento como reencontrada, um card "Reencontrado" é adicionado com a data/hora, local (se informado) e descrição (se informada). Para reencontros antigos sem esses dados, exibe "Local não informado" e a data do evento (usa `data_hora_reencontro` se preenchido, senão `atualizado_em` da ocorrência; descrição padrão: "Reencontrado pelo tutor.").

Ao marcar como reencontrado, o tutor pode informar opcionalmente: local do reencontro, descrição e data/hora. Esses dados são salvos na ocorrência e aparecem no histórico.

## Verificações e testes

```sh
cd frontend
npm run lint
npm run test
npm run build
cd ../backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Os testes Django usam o banco de teste derivado da configuração PostgreSQL. É necessário que o PostgreSQL configurado esteja acessível para criar o banco temporário. Os testes de upload usam diretório de mídia temporário e removem os arquivos após a execução.
