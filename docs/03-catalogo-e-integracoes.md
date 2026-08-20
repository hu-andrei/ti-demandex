# Catálogo e integrações

## 1. Fonte de configuração

As equipes e os templates são definidos em:

```text
js/modules/data.js
```

Esse arquivo deve ser tratado como a fonte principal para manutenção do catálogo.

## 2. Estrutura de equipe

Cada equipe possui os seguintes metadados:

```js
{
  id,
  name,
  emoji,
  color,
  icon,
  projectUrl,
  description,
  templates
}
```

### Campos

- `id`: identificador estável usado internamente;
- `name`: nome exibido;
- `emoji`: elemento decorativo;
- `color`: cor de destaque;
- `icon`: SVG usado no card;
- `projectUrl`: URL do GitHub Project;
- `description`: descrição funcional;
- `templates`: lista de tipos de demanda.

## 3. Estrutura de template

Os templates são representados como arrays:

```js
[
  "Título",
  "Descrição",
  "arquivo.yml ou URL absoluta",
  "Categoria opcional"
]
```

Quando o terceiro item contém apenas o nome de um YAML, o portal combina o valor com `ISSUE_BASE`.

## 4. URL-base de Issues

No código analisado:

```text
https://github.com/ti-hu-org/ti-demandas/issues/new?template=
```

Templates hospedados em outro repositório devem usar URL absoluta.

## 5. GitHub Projects

Cada equipe possui uma URL própria de Project configurada no catálogo.

Valores presentes no código analisado:

| Contexto | Project configurado |
| --- | --- |
| Suporte | `ti-hu-org/projects/6/views/15` |
| Business Intelligence | `ti-hu-org/projects/6/views/12` |
| Desenvolvimento | `ti-hu-org/projects/6/views/13` |
| RPA | `ti-hu-org/projects/6/views/14` |
| Qualidade | `ti-hu-org/projects/19/views/5` |

## 6. Fluxo de Qualidade

O contexto de Qualidade utiliza configuração separada:

- `QUALITY_PROJECT_URL`;
- `qualityTemplates`.

No código analisado, o template aponta para:

```text
https://github.com/ti-hu-org/ti-qualidade/issues/new?template=solicitacao_qualidade.yml
```

> **Ponto de atenção:** caso o nome oficial do repositório seja `ti-qualidades`, atualize a URL para evitar direcionamento incorreto.

## 7. Adicionar uma equipe

1. Defina ou reutilize um ícone em `icons`.
2. Adicione um novo objeto em `teams`.
3. Escolha um `id` estável e único.
4. Informe `projectUrl`.
5. Adicione os templates.
6. Valide a renderização em todas as visualizações.
7. Valide o preenchimento do seletor de equipe do perfil.
8. Teste links externos.
9. Execute o build.

## 8. Adicionar um template

1. Localize a equipe em `teams`.
2. Adicione o template no array `templates`.
3. Use nome de YAML quando o formulário estiver em `ti-demandas`.
4. Use URL absoluta quando o formulário estiver em outro repositório.
5. Defina a categoria quando necessário.
6. Teste o link gerado.

## 9. Boas práticas

- não alterar `id` de equipe sem avaliar preferências já persistidas;
- validar URLs após renomear repositórios ou Projects;
- manter títulos curtos e descritivos;
- evitar duplicidade de templates;
- manter categorias semanticamente consistentes;
- testar em ambiente autenticado com um usuário que possua as permissões reais de acesso.
