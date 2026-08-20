# DEMANDex — Portal de Demandas de TI

O **DEMANDex** é um portal web estático interno que centraliza o acesso aos fluxos de abertura de demandas de Tecnologia no GitHub. A aplicação organiza os formulários por equipe, apresenta atalhos para os respectivos GitHub Projects e oferece um contexto específico para demandas de Qualidade.

## Objetivo

Reduzir a necessidade de o usuário conhecer previamente qual repositório, formulário ou quadro deve utilizar. O DEMANDex funciona como uma camada de descoberta e direcionamento; o registro e o gerenciamento das demandas continuam sendo realizados no GitHub Issues e no GitHub Projects.

## Escopo atual

O catálogo possui contextos para:

- Suporte;
- Business Intelligence;
- Desenvolvimento;
- RPA;
- Qualidade, por meio de um fluxo específico.

Entre os recursos disponíveis estão:

- catálogo centralizado de equipes e templates;
- agrupamento de templates por categoria;
- links para abertura de GitHub Issues;
- links para GitHub Projects;
- visualizações em grade, lista e menu;
- perfil local com apelido e equipe padrão;
- 16 paletas visuais;
- 14 famílias tipográficas;
- texturas, bordas animadas e emojis configuráveis;
- hover 3D opcional nos cards;
- persistência de preferências no `localStorage`;
- suporte a `prefers-reduced-motion`;
- build estático minificado;
- CI/CD com GitHub Actions;
- publicação no GitHub Pages;
- análise de desempenho com Lighthouse.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES Modules
- Web Animations API
- Python 3.12+
- `rjsmin` e `rcssmin`
- GitHub Issues
- GitHub Projects
- GitHub Actions
- GitHub Pages
- Lighthouse

## Estrutura principal

```text
.
├── .github/workflows/pages.yml
├── assets/
├── css/
├── html/index.html
├── js/
│   ├── script.js
│   └── modules/
│       ├── animations.js
│       ├── data.js
│       ├── dom.js
│       ├── portal.js
│       └── preferences.js
├── tools/build.py
├── Makefile
├── VERSION
└── README.md
```

O diretório `dist/` é produzido pelo processo de build e representa a versão pronta para publicação.

## Execução local

Requisitos:

- Python 3.12 ou superior;
- `make`, quando disponível.

Inicie o servidor local:

```bash
make start
```

Acesse:

```text
http://127.0.0.1:8010/html/
```

Outros comandos:

```bash
make stop
make restart
make build
make clean
make help
```

Sem `make`:

```bash
python3 -m http.server 8010 --bind 127.0.0.1
```

## Build

Instale as dependências do build:

```bash
python3 -m pip install rjsmin rcssmin
```

Execute:

```bash
make build
```

ou:

```bash
python3 tools/build.py
```

A saída é gerada em `dist/`.

## Documentação

A documentação técnica e operacional está em [`docs/`](docs/):

- [`docs/01-visao-geral-funcional.md`](docs/01-visao-geral-funcional.md)
- [`docs/02-arquitetura.md`](docs/02-arquitetura.md)
- [`docs/03-catalogo-e-integracoes.md`](docs/03-catalogo-e-integracoes.md)
- [`docs/04-preferencias-e-interface.md`](docs/04-preferencias-e-interface.md)
- [`docs/05-desenvolvimento-e-build.md`](docs/05-desenvolvimento-e-build.md)
- [`docs/06-operacao.md`](docs/06-operacao.md)
- [`docs/07-ci-cd-e-publicacao.md`](docs/07-ci-cd-e-publicacao.md)
- [`docs/08-acessibilidade-e-animacoes.md`](docs/08-acessibilidade-e-animacoes.md)
- [`docs/09-troubleshooting.md`](docs/09-troubleshooting.md)
- [`docs/10-checklist-operacional.md`](docs/10-checklist-operacional.md)

## Observações de configuração

O catálogo é mantido em `js/modules/data.js`. Alterações em equipes, templates e URLs de Project devem ser realizadas nesse arquivo e validadas antes da publicação.

> **Atenção:** no código analisado, o fluxo de Qualidade aponta para o repositório `ti-hu-org/ti-qualidade`. Caso o repositório oficial seja `ti-hu-org/ti-qualidades`, a URL deve ser corrigida no catálogo antes da publicação.

## Licença

Uso interno proprietário.
