# Changelog

Todas as mudanças relevantes do DEMANDex são documentadas neste arquivo.

## [0.2.0] — 2026-08-28

### Melhorado

- Adicionada busca rápida com `Ctrl+K`, navegação por teclado e ações para localizar equipes, templates e configurações.
- Organizadas as configurações de aparência em subtabs de tema, cards e background.
- Adicionado carregamento sob demanda das fontes selecionadas e controle de tamanho das texturas dos cards.
- Removidas as opções e os estilos dos backgrounds animados do portal, mantendo os backgrounds estáticos.
- Adicionadas as paletas temáticas Hacker, Sentinela, Dataforge e Autômata, com cores inspiradas nas equipes correspondentes, totalizando 20 paletas disponíveis.
- Adicionadas bordas animadas de cards para Sentinela, Dataforge e Autômata, seguindo o estilo da borda Hacker.
- Corrigida a cor do ícone da lupa para acompanhar a cor principal da paleta ativa.
- Ajustado o alinhamento da visualização em lista em telas menores, incluindo a posição da numeração dos cards.
- Reposicionado o botão de favorito nos cards de templates e removida sua transformação no hover.
- Melhorado o contraste do ícone de favorito no hover e no estado ativo, sem fundo ou quadrado permanente.
- Os badges “Mais utilizadas” agora exibem os templates favoritos da equipe correspondente e retornam aos placeholders quando não há favoritos.
- Adicionados ao catálogo os templates de sub-issue de Suporte, BI, Desenvolvimento e RPA, agrupados na categoria `Sub-issues`.
- Melhorada a estabilidade do hover 3D dos cards, mantendo a área de interação estável durante a inclinação.

## [0.1.0] — 2026-08-20

Primeira versão preparada para publicação do Portal de Demandas de TI.

### Adicionado

- Catálogo centralizado de demandas para Suporte, Business Intelligence, Desenvolvimento, RPA e Qualidade.
- Organização dos templates por equipe e categoria, com links para GitHub Issues e GitHub Projects.
- Visualizações em grade, lista e menu.
- Perfil local com apelido e equipe padrão, com persistência no `localStorage`.
- Personalização visual com 16 paletas, 14 fontes, texturas, bordas animadas, emojis e hover 3D opcional.
- Tema claro/escuro e suporte a `prefers-reduced-motion`.
- Build estático minificado com Python, CI/CD via GitHub Actions, publicação no GitHub Pages e análise com Lighthouse.
- Documentação técnica e operacional sobre visão funcional, arquitetura, catálogo, preferências, build, operação, publicação, acessibilidade e troubleshooting.

### Melhorado

- README reorganizado com objetivo, escopo, tecnologias, estrutura do projeto, execução local, build e publicação.
- Orientações para manutenção do catálogo de equipes, templates e URLs de Projects.
- Checklist operacional para validação antes da publicação.

[0.1.0]: https://github.com/hu-andrei/ti-demandas-portal/releases/tag/v0.1.0
[0.2.0]: https://github.com/hu-andrei/ti-demandas-portal/releases/tag/v0.2.0
