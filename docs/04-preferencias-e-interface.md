# Preferências e interface

## 1. Persistência local

As preferências são salvas em `localStorage`. As chaves atuais são:

| Preferência | Chave |
| --- | --- |
| Visualização | `ti-demandas-view` |
| Perfil | `ti-demandas-profile` |
| Paleta | `ti-demandas-palette` |
| Fonte | `ti-demandas-font` |
| Background | `ti-demandas-background` |
| Textura | `ti-demandas-card-texture` |
| Tamanho da textura | `ti-demandas-card-texture-size` |
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
- cobalt;
- hacker;
- suporte;
- bi;
- rpa.

Valores inválidos retornam para `default`.

Na interface, as paletas `suporte`, `bi` e `rpa` são apresentadas como **Sentinela**, **Dataforge** e **Autômata**, respectivamente.

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
- starlight;
- hacker.

O tamanho da textura aceita `small`, `default` e `large`.

## 6. Backgrounds

Valores estáticos aceitos:

- default;
- aurora;
- spotlight;
- horizon;
- grid;
- nebula.

Valores removidos ou desconhecidos retornam para `default`; backgrounds animados não são suportados.

## 7. Bordas

Efeitos disponíveis:

- none;
- rgb;
- team;
- orbit;
- pulse;
- prism;
- hacker;
- suporte;
- bi;
- rpa.

As animações de borda são canceladas antes da aplicação de um novo efeito, evitando múltiplas instâncias concorrentes.

Na interface, as bordas `suporte`, `bi` e `rpa` são identificadas como **Sentinela — varredura azul**, **Dataforge — pulso âmbar** e **Autômata — circuito violeta**.

## 8. Emojis

Variações configuráveis:

- default;
- android;
- ios;
- mac;
- windows;
- linux.

## 9. Hover 3D

A inclinação 3D é opcional e baseada na posição do cursor. O estado é persistido como string booleana no `localStorage`.

O efeito deve permanecer desabilitado ou reduzido quando o usuário prefere menos movimento.

## 10. Visualização

Os modos suportados são:

```text
grid
list
menu
```

Valores persistidos fora desse conjunto devem ser tratados como inválidos e substituídos pelo padrão da aplicação.

## 11. Busca e favoritos

A busca rápida é aberta por `Ctrl+K` ou `⌘K`. Os itens recentes são armazenados em `ti-demandas-command-recent`.

Os favoritos usam `ti-demandas-favorite-templates`. Eles atualizam os badges “Mais utilizadas” somente no card da equipe correspondente; a remoção do último favorito restaura os badges padrão.

## 12. Limpeza de preferências

Para reset operacional completo, remova as chaves `ti-demandas-*` do armazenamento local do navegador.

Em DevTools:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("ti-demandas-"))
  .forEach((key) => localStorage.removeItem(key));
```

Depois, recarregue a página.
