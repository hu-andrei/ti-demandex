# Preferências e interface

## 1. Persistência local

As preferências são salvas em `localStorage`. As chaves atuais são:

| Preferência | Chave |
| --- | --- |
| Visualização | `ti-demandas-view` |
| Perfil | `ti-demandas-profile` |
| Paleta | `ti-demandas-palette` |
| Fonte | `ti-demandas-font` |
| Textura | `ti-demandas-card-texture` |
| Borda | `ti-demandas-card-border` |
| Emoji | `ti-demandas-card-emoji` |
| Hover 3D | `ti-demandas-card-tilt` |

## 2. Perfil

O perfil local pode armazenar:

- apelido;
- equipe padrão.

Ao restaurar o perfil, o código valida se a equipe ainda existe no catálogo. IDs desconhecidos são descartados.

## 3. Paletas

Paletas aceitas pelo código:

- default;
- dracula;
- catppuccin;
- everforest;
- nord;
- tokyo-night;
- gruvbox;
- solarized;
- one-dark;
- rose-pine;
- monokai;
- kanagawa;
- ayu;
- material-ocean;
- synthwave;
- cobalt.

Valores inválidos retornam para `default`.

## 4. Fontes

Fontes aceitas:

- DM Sans;
- Inter;
- Manrope;
- Space Grotesk;
- Outfit;
- Plus Jakarta Sans;
- IBM Plex Sans;
- Fira Sans;
- Source Sans 3;
- Sora;
- Rubik;
- Work Sans;
- Nunito Sans;
- JetBrains Mono.

O fallback lógico é `dm-sans`.

## 5. Texturas

Valores aceitos:

- none;
- mist;
- grain;
- aurora;
- paper;
- lines;
- glow;
- waves;
- topography;
- hive;
- sci-fi;
- circuit;
- mesh;
- starlight.

## 6. Bordas

Efeitos disponíveis:

- none;
- rgb;
- team;
- orbit;
- pulse;
- prism.

As animações de borda são canceladas antes da aplicação de um novo efeito, evitando múltiplas instâncias concorrentes.

## 7. Emojis

Variações configuráveis:

- default;
- android;
- ios;
- mac;
- windows;
- linux.

## 8. Hover 3D

A inclinação 3D é opcional e baseada na posição do cursor. O estado é persistido como string booleana no `localStorage`.

O efeito deve permanecer desabilitado ou reduzido quando o usuário prefere menos movimento.

## 9. Visualização

Os modos suportados são:

```text
grid
list
menu
```

Valores persistidos fora desse conjunto devem ser tratados como inválidos e substituídos pelo padrão da aplicação.

## 10. Limpeza de preferências

Para reset operacional completo, remova as chaves `ti-demandas-*` do armazenamento local do navegador.

Em DevTools:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("ti-demandas-"))
  .forEach((key) => localStorage.removeItem(key));
```

Depois, recarregue a página.
