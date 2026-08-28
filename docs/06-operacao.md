# Operação do DEMANDex

## 1. Objetivo operacional

Este documento descreve as rotinas necessárias para manter o portal funcional após sua publicação.

## 2. Operação normal

O DEMANDex é estático. Não existe processo de backend a monitorar em produção. A disponibilidade depende principalmente de:

- GitHub Pages;
- disponibilidade das URLs do GitHub Issues;
- disponibilidade dos GitHub Projects;
- permissões dos usuários;
- recursos externos utilizados pela interface.

## 3. Rotinas de manutenção

### Alterar formulário de uma demanda

1. edite `js/modules/data.js`;
2. altere o arquivo YAML ou URL do template;
3. teste localmente;
4. valide o formulário no GitHub;
5. gere o build;
6. publique via pipeline.

Para uma subtarefa, mantenha a categoria `Sub-issues` e confira se o YAML está associado à equipe correta.

### Alterar favoritos ou badges “Mais utilizadas”

Não há configuração de servidor para esse recurso. Os favoritos são definidos pelo usuário no navegador e persistidos no `localStorage`; para restaurar os badges padrão de uma equipe, remova todos os favoritos daquela equipe.

### Alterar Project de uma equipe

1. obtenha a URL oficial da view desejada;
2. altere `projectUrl` da equipe;
3. teste com um usuário autorizado;
4. publique a alteração.

### Alterar contexto de Qualidade

Revise:

```js
QUALITY_PROJECT_URL
qualityTemplates
```

Como o fluxo pode usar outro repositório, confirme também o nome oficial e as permissões do repositório.

### Atualizar versão

1. altere `VERSION`;
2. gere o build;
3. valide a versão no painel **Info**;
4. faça commit e push para a branch de publicação.

## 4. Monitoramento

Não há telemetria própria no código analisado. A operação deve se apoiar em:

- status da execução do GitHub Actions;
- artefato Lighthouse;
- disponibilidade do GitHub Pages;
- validação manual dos principais links;
- feedback dos usuários.

## 5. Incidentes comuns

### Portal abre, mas um template falha

Provável causa: URL ou nome do arquivo YAML inválido.

Ação:

- revisar `data.js`;
- abrir a URL manualmente;
- confirmar se o template existe no repositório.

### Project retorna acesso negado

Provável causa: permissão do usuário ou URL da view incorreta.

Ação:

- validar acesso direto ao Project;
- confirmar participação/permissões na organização;
- revisar `projectUrl`.

### Preferência visual não é salva

Ação:

- verificar se `localStorage` está disponível;
- inspecionar erros no console;
- limpar chaves `ti-demandas-*` e testar novamente.

### Versão aparece como indisponível

Ação:

- confirmar presença de `VERSION`;
- confirmar presença de `dist/VERSION` após build;
- verificar o caminho de carregamento no ambiente publicado.

### Busca rápida não abre ou não encontra um template

Verifique se `js/modules/command.js` está sendo carregado, se o atalho `Ctrl+K` não está sendo capturado pelo navegador e se o template está presente em `js/modules/data.js`.

## 6. Mudanças de configuração

Toda alteração operacional relevante deve ser versionada. Evite alterações manuais diretamente no conteúdo publicado quando elas não estiverem refletidas no repositório-fonte.

## 7. Responsabilidades sugeridas

### Desenvolvimento

- código;
- catálogo;
- correções;
- build;
- documentação técnica.

### Administração do GitHub / responsável pelo processo

- permissões;
- Projects;
- Issue Forms;
- views;
- disponibilidade dos repositórios.

### Equipes atendentes

- validação dos templates;
- validação dos tipos de demanda;
- atualização de necessidades do catálogo.
