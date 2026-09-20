# Widget Server — Image Upload API

[Português](#português) · [English](#english) · [C4 Model](docs/architecture/C4.md)

Fastify service for receiving image streams and storing them in Cloudflare R2.

## Português

### Visão geral

O **Widget Server** é uma API de upload construída com Node.js, Fastify e TypeScript. O endpoint recebe um arquivo multipart de até 4 MB, valida seus dados, envia o stream para um bucket Cloudflare R2 e retorna a URL pública do objeto.

### Funcionalidades

- upload multipart por streaming;
- limite de 4 MB por arquivo;
- sanitização do nome do arquivo;
- armazenamento compatível com S3 no Cloudflare R2;
- validação das variáveis de ambiente com Zod;
- imagem Docker multi-stage;
- pipelines GitHub Actions para construção e publicação de imagens.

### Arquitetura

```text
Cliente HTTP -> Fastify -> UploadImageToStorage -> StorageProvider -> Cloudflare R2
```

Veja os diagramas C4 e o fluxo de upload em [docs/architecture/C4.md](docs/architecture/C4.md).

### Tecnologias

| Área | Tecnologias |
|---|---|
| API | Node.js 20, Fastify 5 e TypeScript |
| Upload | `@fastify/multipart` |
| Armazenamento | Cloudflare R2 e AWS SDK para S3 |
| Validação | Zod |
| Build e execução | tsx, tsup, pnpm e Docker |
| Entrega | GitHub Actions, Docker Hub e fluxo ECR em evolução |

### Estrutura

```text
.
├── .github/workflows/               # pipelines de imagem
├── src/
│   ├── functions/                   # caso de uso de upload
│   ├── routes/                      # rota de upload reutilizável
│   ├── storage/                     # contrato de armazenamento
│   │   └── providers/               # implementação Cloudflare R2
│   ├── env.ts                       # validação da configuração
│   └── server.ts                    # composição e inicialização
├── Dockerfile
├── docker-compose.yaml
└── .env.example
```

### Configuração

Copie o modelo e preencha apenas no seu ambiente local ou gerenciador de segredos:

```bash
cp .env.example .env
```

Variáveis exigidas:

```env
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_PUBLIC_URL=
```

Nunca versionar valores reais. Antes de qualquer implantação, remova credenciais embutidas em imagens ou arquivos e rotacione qualquer chave que já tenha sido exposta.

### Como executar

```bash
pnpm install
pnpm dev
```

A API inicia em `http://localhost:3333`.

Para gerar e executar a versão de produção:

```bash
pnpm build
pnpm start
```

### Endpoints

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/` | Verificação simples de disponibilidade |
| `POST` | `/uploads` | Receber o arquivo e retornar sua URL pública |

Exemplo:

```bash
curl -X POST http://localhost:3333/uploads \
  -F "file=@imagem.png"
```

Resposta esperada:

```json
{
  "url": "https://dominio-publico-r2.exemplo/images/imagem.png"
}
```

### Limitações atuais

- não há autenticação nem rate limiting;
- os tipos MIME permitidos não são restringidos;
- nomes iguais podem substituir objetos existentes;
- a rota aparece implementada diretamente em `server.ts` e também em um módulo separado;
- o PostgreSQL presente no Compose não é utilizado pela aplicação atual;
- os fluxos de CI precisam ser consolidados e testados com os registries escolhidos.

---

## English

### Overview

**Widget Server** is a Node.js, Fastify and TypeScript upload API. It accepts a multipart file up to 4 MB, validates the request, streams the object to Cloudflare R2 and returns its public URL.

### Architecture and stack

The Fastify HTTP adapter invokes the `UploadImageToStorage` use case through a `StorageProvider` abstraction. `R2StorageProvider` implements that port with the S3-compatible AWS SDK. See [docs/architecture/C4.md](docs/architecture/C4.md).

| Area | Technologies |
|---|---|
| API | Node.js 20, Fastify 5 and TypeScript |
| Upload | `@fastify/multipart` |
| Storage | Cloudflare R2 and AWS SDK for S3 |
| Validation | Zod |
| Delivery | tsup, pnpm, Docker and GitHub Actions |

### Running locally

Create an untracked `.env` from `.env.example`, provide the five Cloudflare variables listed above, and run:

```bash
pnpm install
pnpm dev
```

The service listens on `http://localhost:3333`. Use `pnpm build && pnpm start` for the production build.

### Security notice

Real credentials must exist only in a secret manager or deployment environment. Rotate any credential that has ever been committed or embedded in an image, because removing it from the latest revision does not remove it from Git history.

### Project status

The core upload flow is implemented. Authentication, rate limiting, MIME allowlists, collision-resistant object keys, automated tests and consolidated delivery pipelines are recommended before production use.

## License

No license file is currently included in this repository.
