# Acessibilidade e animações

## 1. Princípios

A interface combina animações com requisitos de acessibilidade. Efeitos visuais devem ser considerados complementares e nunca necessários para compreender ou operar o portal.

## 2. Movimento reduzido

O código usa:

```js
window.matchMedia("(prefers-reduced-motion: reduce)")
```

Quando o usuário prefere menos movimento, animações decorativas e determinados efeitos são reduzidos ou desativados.

## 3. Web Animations API

A aplicação utiliza Web Animations API para:

- transições de interface;
- atualização do cabeçalho;
- efeitos decorativos;
- troca de tema;
- bordas animadas;
- microinterações.

As animações de borda são explicitamente canceladas antes de novas instâncias serem iniciadas.

## 4. Foco e navegação

O código do portal ajusta estados de acessibilidade conforme cards e painéis são abertos ou fechados. Entre os mecanismos identificados estão:

- `aria-expanded`;
- `aria-hidden`;
- `aria-selected`;
- `role="dialog"`;
- `role="tab"`;
- `role="tabpanel"`;
- `role="radiogroup"`;
- `role="radio"`;
- `role="switch"`.

A busca rápida usa `role="dialog"`, campo de busca com relação a `role="listbox"` e suporte a `Escape`, setas e `Enter`.

Templates ocultos não devem permanecer navegáveis por teclado.

## 5. Recomendações para novas funcionalidades

Ao adicionar componentes:

- usar elemento HTML nativo sempre que possível;
- preservar foco visível;
- definir nome acessível para ícones e botões;
- sincronizar `aria-*` com o estado real;
- não depender exclusivamente de cor;
- testar zoom e diferentes larguras;
- respeitar `prefers-reduced-motion`;
- evitar animações de layout excessivas;
- priorizar `transform` e `opacity` em efeitos visuais.

## 6. Testes manuais mínimos

- navegar pela página apenas com `Tab` e `Shift+Tab`;
- abrir e fechar cards pelo teclado;
- abrir configurações pelo teclado;
- abrir e fechar a busca rápida com `Ctrl+K` e `Escape`;
- navegar pelos resultados da busca com setas e `Enter`;
- alternar abas do painel;
- verificar foco ao fechar modal/painel;
- ativar `prefers-reduced-motion` no sistema operacional;
- validar que a interface continua funcional sem animações;
- testar contraste nos temas utilizados.
