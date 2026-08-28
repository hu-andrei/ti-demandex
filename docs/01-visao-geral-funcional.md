# Visão geral funcional

## 1. Finalidade

O DEMANDex é uma interface de navegação para os processos de abertura de demandas de Tecnologia. Seu propósito é reduzir erros de direcionamento e tornar mais simples a escolha do formulário correto no GitHub.

A aplicação **não substitui** o GitHub Issues nem o GitHub Projects. Ela concentra os caminhos de entrada e apresenta as opções de forma contextual.

## 2. Perfis de uso

O portal atende principalmente usuários internos que precisam:

- registrar uma nova demanda;
- identificar qual equipe atende determinado tipo de solicitação;
- acessar o formulário correto;
- abrir o quadro da equipe responsável;
- registrar uma demanda de Qualidade;
- personalizar a apresentação do portal no próprio navegador.

## 3. Fluxo principal

1. O usuário acessa o portal.
2. O sistema apresenta as equipes cadastradas.
3. O usuário seleciona uma equipe.
4. O portal exibe os tipos de demanda disponíveis para aquele contexto.
5. O usuário seleciona um template.
6. O navegador é direcionado ao GitHub Issues com o formulário correspondente.
7. O acompanhamento posterior ocorre no GitHub, fora do DEMANDex.

Também é possível acessar diretamente o GitHub Project associado ao contexto selecionado.

## 4. Equipes disponíveis

### Suporte

Destinado a incidentes, acessos, equipamentos, infraestrutura, telefonia e atendimento ao usuário.

Templates presentes no catálogo analisado, organizados em **Geral**, **Sub-issues** e **Telefonia**:

- Solicitação geral;
- Chamado SAT;
- Acompanhamento diário SAT;
- Registro diário;
- Sub-issue de Suporte.
- Telefonia | Solicitação ou ajuste.

### Business Intelligence

Destinado a dashboards, relatórios, indicadores, análises e dados.

Templates presentes:

- Dashboard, relatório ou análise;
- KPI;
- Sub-issue de BI.

### Desenvolvimento

Destinado a sistemas, APIs, integrações, funcionalidades e melhorias técnicas.

Templates presentes:

- Funcionalidade, correção ou integração;
- Setup técnico;
- Sub-issue de Desenvolvimento.

### RPA

Destinado a automações, robôs, rotinas operacionais e monitoramento de processos.

Templates presentes:

- Automação ou ajuste;
- Sub-issue de RPA.

### Qualidade

O fluxo de Qualidade é tratado como um contexto específico, com template próprio e acesso ao respectivo Project.

## 5. Modos de visualização

A interface permite alternar entre:

- **grade**: cards distribuídos em layout de grid;
- **lista**: visualização linear e mais compacta;
- **menu**: apresentação orientada a navegação por menu.

A escolha é persistida no navegador.

## 6. Perfil local

O painel de configurações permite registrar:

- apelido do usuário;
- equipe padrão.

Esses dados são armazenados somente no `localStorage`. A equipe salva pode ser usada para restaurar automaticamente o contexto do portal em novos acessos.

## 7. Personalização

O portal oferece configurações de aparência, incluindo:

- paleta;
- fonte;
- textura dos cards;
- borda dos cards;
- variação de emoji;
- hover 3D.

As preferências são locais ao navegador e não são sincronizadas com servidor.

Os backgrounds disponíveis são estáticos. As opções animadas foram removidas para manter uma experiência visual mais estável.

## 8. Busca e favoritos

A busca rápida pode ser aberta pelo botão **Buscar** ou por `Ctrl+K` (`⌘K` no macOS). Ela localiza equipes, templates e ações do portal.

Cada template pode ser marcado como favorito. Os favoritos são persistidos localmente e substituem os badges “Mais utilizadas” apenas no card da equipe à qual pertencem. Sem favoritos naquela equipe, os badges padrão retornam.

## 9. Limites funcionais

O DEMANDex não executa:

- criação de issue por API própria;
- edição de issues;
- autenticação própria;
- persistência de demandas em banco próprio;
- gestão do ciclo de vida da issue;
- movimentação de cards no GitHub Projects;
- alteração automática dos formulários de issue.
