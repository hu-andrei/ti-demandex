# CI/CD e publicação

## 1. Workflow

O pipeline está definido em:

```text
.github/workflows/pages.yml
```

Nome do workflow:

```text
Deploy site to GitHub Pages
```

## 2. Gatilhos

O workflow executa em:

- push para `main`;
- execução manual por `workflow_dispatch`.

## 3. Permissões

O workflow solicita:

```yaml
contents: read
pages: write
id-token: write
```

Essas permissões são necessárias para leitura do repositório e publicação no GitHub Pages com OIDC.

## 4. Concorrência

O grupo de concorrência é `pages`, com:

```yaml
cancel-in-progress: true
```

Uma execução mais nova pode cancelar uma publicação anterior ainda em andamento.

## 5. Etapas

### Checkout

Usa `actions/checkout@v4`.

### Configuração do Pages

Usa `actions/configure-pages@v5`.

### Python

Configura Python 3.12 com `actions/setup-python@v5`.

### Node.js

Configura Node.js 22 com `actions/setup-node@v4`.

### Build

Instala:

```text
rjsmin
rcssmin
```

Depois executa:

```bash
python tools/build.py
```

### Lighthouse

O pipeline inicia um servidor HTTP local na porta `4173` apontando para `dist/` e executa Lighthouse 12 em preset desktop, apenas na categoria `performance`.

O resultado é gravado em:

```text
lighthouse-report.json
```

### Artefato de desempenho

O relatório é publicado com o nome:

```text
lighthouse-report
```

### Artefato do site

`dist/` é enviado para o GitHub Pages.

### Deploy

A publicação usa `actions/deploy-pages@v4`.

Como as etapas são sequenciais, uma falha no build, no Lighthouse ou no envio do artefato impede a execução do deploy. O conteúdo publicado é exclusivamente o diretório `dist/` produzido por `tools/build.py` dentro do workflow.

## 6. Configuração inicial do repositório

No GitHub:

1. abra **Settings**;
2. acesse **Pages**;
3. em **Build and deployment**, selecione **GitHub Actions**;
4. confirme que Actions está habilitado;
5. confirme as permissões necessárias para Pages.

## 7. Homologação após deploy

Após uma publicação bem-sucedida:

- abrir a URL do Pages;
- conferir versão exibida;
- testar um template de cada equipe;
- testar o acesso ao Project de cada equipe;
- testar Qualidade;
- testar configurações;
- testar busca rápida e favoritos;
- revisar o relatório Lighthouse;
- verificar console do navegador.

## 8. Rollback

O projeto não possui mecanismo de rollback dedicado no código analisado. O procedimento operacional recomendado é:

1. identificar o último commit estável;
2. reverter o commit problemático ou restaurar o estado estável em uma nova alteração;
3. enviar para `main`;
4. aguardar a nova execução do workflow;
5. homologar novamente.

Evite modificar manualmente o artefato do Pages fora do fluxo versionado.
