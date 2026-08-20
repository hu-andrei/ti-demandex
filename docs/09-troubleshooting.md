# Troubleshooting

## 1. `make start` informa que o servidor já está em execução

O Makefile usa `.server.pid`.

Verifique:

```bash
cat .server.pid
ps -p "$(cat .server.pid)"
```

Para encerrar pelo fluxo normal:

```bash
make stop
```

Se o PID estiver obsoleto, remova `.server.pid` somente após confirmar que o processo não existe.

## 2. Porta 8010 ocupada

Use outra porta:

```bash
make start PORT=8080
```

## 3. Build falha por módulo Python ausente

Sintomas:

```text
ModuleNotFoundError: No module named 'rjsmin'
```

ou equivalente para `rcssmin`.

Correção:

```bash
python3 -m pip install rjsmin rcssmin
```

## 4. `dist/` não reflete uma alteração

Confirme que a alteração foi feita na árvore-fonte, não somente em `dist/`.

Depois execute:

```bash
make build
```

## 5. Link de issue abre página incorreta

Revise `js/modules/data.js`.

Para templates de `ti-demandas`, confirme o nome exato do YAML. Para outros repositórios, confirme a URL absoluta.

## 6. Fluxo de Qualidade falha

Revise:

```js
QUALITY_PROJECT_URL
qualityTemplates
```

Também confirme o nome oficial do repositório de Qualidade. O código analisado usa `ti-qualidade`.

## 7. Project não abre

- confirme a URL da view;
- teste em aba anônima/autenticada conforme o caso;
- confira permissões do usuário;
- confirme se o Project ou view não foi removido/renomeado.

## 8. Preferências ficam inconsistentes

Limpe apenas as chaves do portal:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("ti-demandas-"))
  .forEach((key) => localStorage.removeItem(key));
```

Recarregue a página.

## 9. Tema ou fonte não muda

- verificar erros no console;
- confirmar valor permitido em `preferences.js`;
- confirmar existência das regras CSS correspondentes;
- limpar a preferência persistida e testar novamente.

## 10. Lighthouse falha no workflow

Verifique:

- se o build gerou `dist/index.html`;
- logs do servidor local iniciado na porta 4173;
- versão do Node.js;
- instalação/execução do `lighthouse@12`;
- erros de carregamento que impeçam a página de estabilizar.

## 11. Deploy do Pages falha

Confirme:

- Pages configurado para GitHub Actions;
- permissões `pages: write` e `id-token: write`;
- ambiente `github-pages` disponível;
- ausência de políticas da organização bloqueando Pages ou Actions.
