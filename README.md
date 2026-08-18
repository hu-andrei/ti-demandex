# Portal de Demandas de TI

Portal estático interno para direcionar solicitações de TI aos formulários corretos do GitHub Issues. A interface agrupa demandas por equipe, oferece personalização visual persistente e é publicada automaticamente no GitHub Pages.

## Funcionalidades

- Catálogo de demandas para **Suporte**, **Business Intelligence**, **Desenvolvimento** e **RPA**.
- Abertura de issues por templates do repositório e acesso ao quadro de cada equipe.
- Cards expansíveis, agrupamento de templates por categoria e destaque de demandas mais usadas.
- Três formatos de visualização: grade, lista e menu.
- Cabeçalho contextual ao abrir uma equipe, com ação de retorno e link para o quadro correspondente.
- Painel de configurações com perfil, aparência e informações do produto.
- Carregamento dinâmico da versão a partir de [`VERSION`](VERSION).

## Personalização

As preferências ficam salvas no `localStorage` do navegador.

### Aparência

- **16 paletas:** Padrão, Dracula, Catppuccin, Everforest, Nord, Tokyo Night, Gruvbox, Solarized, One Dark, Rosé Pine, Monokai, Kanagawa, Ayu Mirage, Material Ocean, Synthwave e Cobalt.
- **14 fontes:** DM Sans, Inter, Manrope, Space Grotesk, Outfit, Plus Jakarta Sans, IBM Plex Sans, Fira Sans, Source Sans 3, Sora, Rubik, Work Sans, Nunito Sans e JetBrains Mono.
- **Texturas de card:** sem textura, névoa, grão, aurora, papel, linhas, brilho, ondas e topografia.
- **Bordas de card:** padrão, RGB animado, cor da equipe animada, traço orbital, pulso neon e prisma giratório.
- **Emojis decorativos de equipe:** originais ou variações semânticas para Android, iOS, macOS, Windows e Linux. Os ícones SVG animados das equipes permanecem inalterados.
- **Hover 3D:** inclinação baseada na posição do cursor, com exclusão do card aberto.

### Acessibilidade e movimento

- Uso de atributos ARIA em controles, abas, painéis e links.
- Controle de foco para templates visíveis ou ocultos.
- Suporte a `prefers-reduced-motion`: animações decorativas e de borda são reduzidas/desativadas conforme a preferência do sistema.

## Arquitetura

O JavaScript é organizado em módulos ES nativos:

```text
js/
├── script.js                 # Inicialização e orquestração da página
└── modules/
    ├── data.js               # Equipes, ícones e templates de issues
    ├── dom.js                # Referências centralizadas de DOM
    ├── animations.js         # Animações de interface e ícones SVG
    ├── portal.js             # Renderização e estado dos cards/equipes
    └── preferences.js        # Configurações, persistência e bordas WAAPI
```

As bordas animadas são executadas com a **Web Animations API** somente nos cards de equipe. As instâncias são canceladas ao trocar o efeito, evitando animações concorrentes e conflitos com o hover 3D.

## Estrutura do repositório

```text
.
├── .github/workflows/pages.yml  # Build, Lighthouse e deploy no GitHub Pages
├── css/                         # Tokens, temas, componentes e animações
├── html/index.html              # Página-fonte
├── js/                          # Aplicação modular em JavaScript
├── tools/build.py               # Build estático minificado
├── VERSION                      # Versão exibida no painel
├── Makefile                     # Atalhos de execução e build
└── README.md
```

`dist/` é gerado pelo build e não é versionado.

## Execução local

Requer Python 3.12+ para o servidor local e para o build.

```bash
make start
```

Abra `http://127.0.0.1:8010/html/`.

Outros comandos:

```bash
make restart  # reinicia o servidor
make stop     # encerra o servidor
make build    # gera a versão minificada em dist/
make clean    # remove arquivos temporários do servidor
```

Sem `make`, execute:

```bash
python -m http.server 8010
```

e acesse `http://127.0.0.1:8010/html/`.

## Build e desempenho

O comando `make build` usa `rjsmin` e `rcssmin` para compactar CSS e JavaScript, preservando a estrutura de módulos. O HTML gerado fica na raiz de `dist/`, pronto para hospedagem estática.

No GitHub Actions, o pipeline:

1. instala Python e Node.js;
2. gera `dist/` minificado;
3. executa Lighthouse em perfil desktop;
4. publica o relatório Lighthouse como artefato;
5. publica `dist/` no GitHub Pages.

O relatório contém métricas como FCP, LCP, TBT e CLS. Consulte-o na execução do workflow para acompanhar o desempenho real da versão publicada.

## Publicação no GitHub Pages

O deploy é disparado em pushes para `main` ou manualmente pela aba **Actions**. Para ativar o Pages:

1. Acesse **Settings → Pages** no repositório.
2. Em **Build and deployment**, escolha **GitHub Actions**.
3. Faça push para `main` ou execute o workflow **Deploy site to GitHub Pages**.

## Manutenção de equipes e templates

Edite [`js/modules/data.js`](js/modules/data.js) para:

- adicionar ou alterar equipes;
- definir cor, ícone, descrição e link do quadro;
- cadastrar templates de issues;
- agrupar templates por categoria.

Templates podem receber um arquivo YAML do repositório ou uma URL completa. Arquivos YAML são combinados automaticamente com a URL-base de criação de issue.

## Tecnologias

- HTML5 e CSS3
- JavaScript ES Modules
- Web Animations API
- Google Fonts
- GitHub Issues e GitHub Projects
- GitHub Pages e GitHub Actions
- Lighthouse

## Licença

Uso interno proprietário.
