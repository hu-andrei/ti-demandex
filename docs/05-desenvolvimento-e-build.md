# Desenvolvimento e build

## 1. Pré-requisitos

Para execução local simples:

- Python 3.12+.

Para build:

- Python 3.12+;
- `rjsmin`;
- `rcssmin`.

Para reproduzir o pipeline de desempenho localmente também é necessário Node.js compatível com o Lighthouse utilizado no workflow.

## 2. Servidor local

Com Makefile:

```bash
make start
```

A aplicação-fonte é servida em:

```text
http://127.0.0.1:8010/html/
```

Parar:

```bash
make stop
```

Reiniciar:

```bash
make restart
```

O processo é controlado por `.server.pid` e registra saída em `.server.log`.

## 3. Build

Instale dependências:

```bash
python3 -m pip install rjsmin rcssmin
```

Execute:

```bash
make build
```

O Makefile delega para:

```bash
python3 tools/build.py
```

## 4. Funcionamento do `build.py`

O script:

1. minifica todos os arquivos CSS;
2. minifica todos os arquivos JavaScript;
3. preserva a estrutura de diretórios;
4. copia `assets/`;
5. lê `html/index.html`;
6. troca caminhos `../css/`, `../js/` e `../assets/` por caminhos relativos à raiz de publicação;
7. grava `dist/index.html`;
8. copia `VERSION` para `dist/VERSION`.

## 5. Controle de versão do produto

A versão exibida na interface é lida do arquivo:

```text
VERSION
```

O mesmo arquivo é copiado para `dist/` durante o build.

Ao atualizar a versão:

1. altere `VERSION`;
2. execute o build;
3. confirme `dist/VERSION`;
4. abra a aplicação e valide a versão exibida no painel de informações.

## 6. Alteração segura do código

Fluxo recomendado:

```text
alterar fonte -> executar localmente -> validar fluxos -> build -> validar dist -> commit -> pipeline
```

Nunca edite `dist/` como fonte principal. As alterações devem ser feitas em `html/`, `css/`, `js/`, `assets/` ou `tools/` e depois regeneradas.

## 7. Validações mínimas antes do commit

- página abre sem erro no console;
- cards das quatro equipes são renderizados;
- templates abrem os links esperados;
- acesso a Project funciona;
- fluxo de Qualidade funciona;
- visualizações grid/list/menu funcionam;
- configurações abrem e fecham;
- preferências persistem;
- `prefers-reduced-motion` não causa falha funcional;
- build conclui sem erro;
- `dist/index.html` abre corretamente.

## 8. Limpeza

```bash
make clean
```

Esse comando remove os arquivos temporários do servidor local, mas não remove `dist/`.
