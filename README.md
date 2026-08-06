# Portal de Demandas de TI

Portal interno para direcionar solicitações de Tecnologia da Informação aos formulários corretos do GitHub Issues.

## Funcionalidades

- Organização das demandas por equipe: Suporte, Business Intelligence, Desenvolvimento e RPA.
- Acesso direto aos templates de abertura de chamados.
- Interface responsiva com tema escuro.
- Publicação automática no GitHub Pages.

## Estrutura do projeto

```text
.
├── .github/workflows/pages.yml  # Workflow de publicação
├── css/                          # Folhas de estilo
├── html/index.html               # Página principal
├── js/script.js                  # Equipes, templates e interações
└── README.md
```

## Execução local

Como o projeto usa arquivos estáticos, basta abrir `html/index.html` no navegador. Para evitar limitações de alguns navegadores ao carregar arquivos locais, pode-se iniciar um servidor HTTP simples:

```bash
python -m http.server 8000
```

Em seguida, acesse `http://localhost:8000/html/`.

## Publicação no GitHub Pages

A publicação é feita pelo GitHub Actions sempre que há um push na branch `main` ou quando o workflow é executado manualmente.

O workflow prepara o site copiando `html/index.html` para a raiz do artefato publicado e incluindo as pastas `css` e `js`. Por isso, o arquivo `index.html` deve permanecer dentro de `html` enquanto essa configuração estiver em uso.

Para ativar o Pages no repositório:

1. Acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça push para a branch `main` ou execute o workflow pela aba **Actions**.

## Configuração dos templates

Os links dos formulários são definidos em `js/script.js`, na constante `ISSUE_BASE` e na lista `teams`. Para adicionar ou alterar um template, atualize o nome, a descrição e o nome do arquivo YAML correspondente.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- GitHub Issues e GitHub Pages
