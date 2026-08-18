/**
 * Preferências locais de aparência, perfil e interação do portal.
 *
 * O módulo aplica configurações visuais ao `documentElement`, coordena o painel
 * de configurações e registra os eventos responsáveis por persistir preferências
 * no `localStorage`.
 *
 * @module preferences
 */

import {
  motion,
  paletteOptions,
  profileNickname,
  profileTeam,
  root,
  settingsCardBorder,
  settingsCardEmoji,
  settingsCardTilt,
  settingsClose,
  settingsFont,
  settingsPanel,
  settingsSurface,
  settingsTexture,
  settingsToggle,
} from "./dom.js";

/**
 * Chaves centralizadas utilizadas na persistência local das preferências.
 *
 * @type {{view: string, profile: string, palette: string, font: string, texture: string, tilt: string}}
 * @constant
 */
export const storageKeys = {
  view: "ti-demandas-view",
  profile: "ti-demandas-profile",
  palette: "ti-demandas-palette",
  font: "ti-demandas-font",
  texture: "ti-demandas-card-texture",
  border: "ti-demandas-card-border",
  emoji: "ti-demandas-card-emoji",
  tilt: "ti-demandas-card-tilt",
};

let themeAnimation = null;
let settingsAnimation = null;
let settingsTabAnimation = null;
let cardBorderAnimations = [];

/**
 * Valores permitidos para preferências enumeradas. Entradas externas que não
 * pertençam a estas listas são substituídas pelos respectivos padrões.
 *
 * @private
 * @type {{palette: string[], font: string[], texture: string[]}}
 */
const valid = {
  palette: [
    "default",
    "dracula",
    "catppuccin",
    "everforest",
    "nord",
    "tokyo-night",
    "gruvbox",
    "solarized",
    "one-dark",
    "rose-pine",
    "monokai",
    "kanagawa",
    "ayu",
    "material-ocean",
    "synthwave",
    "cobalt",
  ],
  font: [
    "dm-sans",
    "inter",
    "manrope",
    "space-grotesk",
    "outfit",
    "plus-jakarta",
    "ibm-plex",
    "fira-sans",
    "source-sans",
    "sora",
    "rubik",
    "work-sans",
    "nunito-sans",
    "jetbrains-mono",
  ],
  texture: [
    "none",
    "mist",
    "grain",
    "aurora",
    "paper",
    "lines",
    "glow",
    "waves",
    "topography",
    "hive",
    "sci-fi",
    "circuit",
    "mesh",
    "starlight",
  ],
  border: ["none", "rgb", "team", "orbit", "pulse", "prism"],
  emoji: ["default", "android", "ios", "mac", "windows", "linux"],
};

/**
 * Remove a classe transitória usada durante a troca de tema.
 *
 * O mesmo callback é utilizado tanto quando a animação termina normalmente
 * quanto quando é cancelada, garantindo limpeza consistente do estado visual.
 *
 * @private
 * @returns {void}
 */
function clearThemeTransitionState() {
  document.documentElement.classList.remove("is-theme-transitioning");
}

/**
 * Obtém a Promise de conclusão de uma animação.
 *
 * @private
 * @param {Animation} animation Animação cuja conclusão será aguardada.
 * @returns {Promise<Animation>} Promise associada à conclusão da animação.
 */
function getFinishedAnimationPromise(animation) {
  return animation.finished;
}

/**
 * Ignora intencionalmente o cancelamento de uma animação puramente visual.
 *
 * @private
 * @returns {void}
 */
function ignoreVisualAnimationCancellation() {}

/**
 * Aplica uma paleta visual válida ao documento e atualiza o estado dos controles.
 *
 * Valores desconhecidos são normalizados para `default`. Quando a troca animada
 * é solicitada e o usuário não prefere movimento reduzido, o documento realiza
 * um breve fade e a mudança efetiva ocorre no ponto médio da animação.
 *
 * @param {string} palette Identificador da paleta desejada.
 * @param {boolean} [animateChange=false] Define se a troca deve usar transição visual.
 * @returns {void}
 */
export function setPalette(palette, animateChange = false) {
  const selected = valid.palette.includes(palette) ? palette : "default";

  /**
   * Sincroniza uma opção de paleta com a paleta selecionada.
   *
   * @private
   * @param {Element} option Opção de paleta representada no DOM.
   * @returns {void}
   */
  function syncPaletteOption(option) {
    const active = option.dataset.palette === selected;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-checked", String(active));
  }

  /**
   * Confirma a paleta selecionada no DOM e nos controles correspondentes.
   *
   * @private
   * @returns {void}
   */
  function commitPalette() {
    document.documentElement.dataset.palette = selected;
    paletteOptions.forEach(syncPaletteOption);
  }

  if (!animateChange || motion.matches) {
    commitPalette();
    return;
  }

  themeAnimation?.cancel();
  document.documentElement.classList.add("is-theme-transitioning");
  themeAnimation = document.documentElement.animate(
    [{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }],
    { duration: 360, easing: "ease-in-out", fill: "both" },
  );
  setTimeout(commitPalette, 180);
  themeAnimation.finished.then(
    clearThemeTransitionState,
    clearThemeTransitionState,
  );
}

/**
 * Aplica a família tipográfica selecionada e sincroniza o campo de configurações.
 *
 * Fontes inválidas são substituídas por `dm-sans`. A animação opcional realiza
 * uma transição de opacidade nos principais elementos textuais antes e depois da
 * troca do atributo `data-font`.
 *
 * @param {string} font Identificador da fonte desejada.
 * @param {boolean} [animateChange=false] Define se a alteração será animada.
 * @returns {void}
 */
export function setFont(font, animateChange = false) {
  const selected = valid.font.includes(font) ? font : "dm-sans";

  /**
   * Confirma a fonte selecionada no documento e no controle de configurações.
   *
   * @private
   * @returns {void}
   */
  function commitFont() {
    document.documentElement.dataset.font = selected;
    if (settingsFont) settingsFont.value = selected;
  }

  if (!animateChange || motion.matches) {
    commitFont();
    return;
  }

  const targets = document.querySelectorAll(
    [
      "h1",
      "h2",
      "h3",
      "p",
      "label",
      "option",
      ".portal-heading__title",
      ".template-number",
      ".template-count",
      ".team-action",
      ".popular-demands__label",
      ".popular-demand",
      ".settings-tab",
      ".palette-option",
      ".settings-save",
    ].join(","),
  );

  /**
   * Cria a animação de transição tipográfica para um elemento textual.
   *
   * @private
   * @param {Element} element Elemento textual que receberá o fade.
   * @returns {Animation} Instância criada pela Web Animations API.
   */
  function createFontTransition(element) {
    return element.animate(
      [{ opacity: 1 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }],
      { duration: 360, easing: "ease-in-out", fill: "both" },
    );
  }

  const animations = [...targets].map(createFontTransition);
  setTimeout(commitFont, 180);
  Promise.all(animations.map(getFinishedAnimationPromise)).catch(
    ignoreVisualAnimationCancellation,
  );
}

/**
 * Aplica a textura visual dos cartões.
 *
 * Valores não reconhecidos são normalizados para `none`. O controle do painel de
 * configurações é sincronizado quando estiver presente na página.
 *
 * @param {string} texture Identificador da textura desejada.
 * @returns {void}
 */
export function setCardTexture(texture) {
  const selected = valid.texture.includes(texture) ? texture : "none";
  document.documentElement.dataset.cardTexture = selected;
  if (settingsTexture) settingsTexture.value = selected;
}

export function setCardBorder(border) {
  const selected = valid.border.includes(border) ? border : "none";
  document.documentElement.dataset.cardBorder = selected;
  if (settingsCardBorder) settingsCardBorder.value = selected;
  startCardBorderAnimations(selected);
}

function startCardBorderAnimations(border) {
  cardBorderAnimations.forEach((animation) => animation.cancel());
  cardBorderAnimations = [];
  if (border === "none" || motion.matches) return;

  root.querySelectorAll(".team-card").forEach((card) => {
    const teamColor = getComputedStyle(card)
      .getPropertyValue("--team-color")
      .trim();
    const shadow = getComputedStyle(card)
      .getPropertyValue("--shadow-card")
      .trim();
    let keyframes;
    let options;

    if (border === "rgb") {
      keyframes = [
        { backgroundPosition: "center, center, 0 0" },
        { backgroundPosition: "center, center, 300% 0" },
      ];
      options = { duration: 4000, easing: "linear", iterations: Infinity };
    } else if (border === "team") {
      keyframes = [
        { backgroundPosition: "center, center, 0 0" },
        { backgroundPosition: "center, center, 200% 0" },
      ];
      options = { duration: 3400, easing: "linear", iterations: Infinity };
    } else if (border === "pulse") {
      const softGlow = `color-mix(in srgb, ${teamColor} 22%, transparent)`;
      const strongGlow = `color-mix(in srgb, ${teamColor} 52%, transparent)`;
      keyframes = [
        {
          boxShadow: `inset 0 1px rgba(255,255,255,.035), inset 0 0 0 1px ${softGlow}, inset 0 0 4px ${softGlow}, ${shadow}`,
          offset: 0,
        },
        {
          boxShadow: `inset 0 1px rgba(255,255,255,.05), inset 0 0 0 1.25px ${strongGlow}, inset 0 0 9px ${softGlow}, ${shadow}`,
          offset: 0.3,
        },
        {
          boxShadow: `inset 0 1px rgba(255,255,255,.07), inset 0 0 0 1.6px ${strongGlow}, inset 0 0 16px ${strongGlow}, ${shadow}`,
          offset: 0.5,
        },
        {
          boxShadow: `inset 0 1px rgba(255,255,255,.05), inset 0 0 0 1.25px ${strongGlow}, inset 0 0 9px ${softGlow}, ${shadow}`,
          offset: 0.7,
        },
        {
          boxShadow: `inset 0 1px rgba(255,255,255,.035), inset 0 0 0 1px ${softGlow}, inset 0 0 4px ${softGlow}, ${shadow}`,
          offset: 1,
        },
      ];
      options = {
        duration: 3000,
        easing: "cubic-bezier(.45, 0, .55, 1)",
        iterations: Infinity,
      };
    } else {
      keyframes = [
        { "--card-border-angle": "0deg" },
        { "--card-border-angle": "360deg" },
      ];
      options = {
        duration: border === "prism" ? 3100 : 3800,
        easing: "linear",
        iterations: Infinity,
      };
    }

    cardBorderAnimations.push(card.animate(keyframes, options));
  });
}

motion.addEventListener?.("change", () => {
  startCardBorderAnimations(
    document.documentElement.dataset.cardBorder || "none",
  );
});

export function setCardEmoji(emoji) {
  const selected = valid.emoji.includes(emoji) ? emoji : "default";
  const platformEmojis = {
    android: { suporte: "🛠️", bi: "📊", dev: "💻", rpa: "🤖" },
    ios: { suporte: "🧰", bi: "📈", dev: "🖥️", rpa: "⚙️" },
    mac: { suporte: "🔧", bi: "📉", dev: "⌨️", rpa: "🦾" },
    windows: { suporte: "🛡️", bi: "📊", dev: "🖥️", rpa: "⚙️" },
    linux: { suporte: "🧑‍🔧", bi: "📈", dev: "🐧", rpa: "🤖" },
  };
  document.documentElement.dataset.cardEmoji = selected;
  if (settingsCardEmoji) settingsCardEmoji.value = selected;
  root.querySelectorAll(".team-card").forEach((card) => {
    const emojiElement = card.querySelector(".team-emoji");
    const iconElement = card.querySelector(".team-icon");
    // Corrige uma seleção aplicada pela implementação anterior e preserva os
    // SVGs animados específicos de cada equipe.
    if (iconElement?.dataset.defaultIcon) {
      iconElement.innerHTML = iconElement.dataset.defaultIcon;
      delete iconElement.dataset.defaultIcon;
    }
    if (emojiElement) {
      if (!emojiElement.dataset.defaultEmoji)
        emojiElement.dataset.defaultEmoji = emojiElement.textContent;
      emojiElement.textContent =
        selected === "default"
          ? emojiElement.dataset.defaultEmoji
          : platformEmojis[selected][card.dataset.team] ||
            emojiElement.dataset.defaultEmoji;
    }
  });
}

/**
 * Habilita ou desabilita o efeito de inclinação 3D dos cartões.
 *
 * O efeito nunca é ativado quando `prefers-reduced-motion` está habilitado. Ao
 * desativar, qualquer transformação inline remanescente é removida dos cartões.
 * O checkbox preserva a preferência solicitada, mesmo quando o efeito visual é
 * impedido por acessibilidade.
 *
 * @param {boolean} enabled Preferência solicitada para o efeito de inclinação.
 * @returns {void}
 */
export function setCardTilt(enabled) {
  const active = Boolean(enabled) && !motion.matches;
  document.documentElement.classList.toggle("has-card-tilt", active);
  if (settingsCardTilt) settingsCardTilt.checked = Boolean(enabled);

  /**
   * Remove a transformação inline de um cartão.
   *
   * @private
   * @param {HTMLElement} card Cartão cuja transformação será limpa.
   * @returns {void}
   */
  function clearCardTransform(card) {
    card.style.removeProperty("transform");
  }

  if (!active)
    root
      .querySelectorAll(".team-card, .template-card")
      .forEach(clearCardTransform);
}

/**
 * Registra os eventos de ponteiro usados pelo efeito de inclinação dos cartões.
 *
 * Durante `pointermove`, calcula rotações X/Y a partir da posição relativa do
 * cursor dentro do cartão. Em `pointerout`, remove a transformação quando o
 * ponteiro realmente deixa o cartão. Cartões abertos não recebem o efeito.
 *
 * @returns {void}
 */
export function setupCardTilt() {
  /**
   * Atualiza a transformação 3D do cartão sob o ponteiro.
   *
   * @param {PointerEvent} event Evento de movimento do ponteiro dentro da raiz.
   * @returns {void}
   */
  function handleCardPointerMove(event) {
    if (!document.documentElement.classList.contains("has-card-tilt")) return;
    const card = event.target.closest(".team-card, .template-card");
    if (!card || card.classList.contains("is-open") || !root.contains(card))
      return;
    const bounds = card.getBoundingClientRect();
    const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
    const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -5;
    card.style.transform = `perspective(1200px) scale(.985) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  }

  /**
   * Remove a transformação 3D quando o ponteiro deixa efetivamente um cartão.
   *
   * Movimentos entre elementos filhos do mesmo cartão não resetam o efeito.
   *
   * @param {PointerEvent} event Evento de saída do ponteiro.
   * @returns {void}
   */
  function handleCardPointerOut(event) {
    const card = event.target.closest(".team-card, .template-card");
    if (card && !card.contains(event.relatedTarget))
      card.style.removeProperty("transform");
  }

  root.addEventListener("pointermove", handleCardPointerMove);
  root.addEventListener("pointerout", handleCardPointerOut);
}

/**
 * Inicializa o painel de configurações e conecta seus controles à aplicação.
 *
 * Registra persistência de fonte, textura, inclinação, paleta e perfil; controla
 * abertura/fechamento do painel; gerencia abas; fecha o painel por clique externo
 * ou `Escape`; e atualiza a saudação padrão após salvar o perfil.
 *
 * @param {PortalController} portal Controlador do portal. Reservado para integrações do painel com o estado principal.
 * @param {{title: string, description: string}} defaultHeading Objeto mutável que contém o cabeçalho padrão do portal.
 * @returns {void}
 */
export function setupSettings(portal, defaultHeading) {
  // Mantém a dependência explícita na assinatura pública para futuras integrações
  // entre configurações e estado do portal sem alterar o contrato da função.
  void portal;

  /**
   * Fecha o painel de configurações, com animação quando permitida.
   *
   * O atributo `aria-expanded` é atualizado imediatamente. Em modo de movimento
   * reduzido, o painel é ocultado sem transição.
   *
   * @returns {void}
   */
  function closeSettings() {
    if (!settingsPanel || settingsPanel.hidden) return;
    settingsToggle?.setAttribute("aria-expanded", "false");
    settingsAnimation?.cancel();

    if (motion.matches) {
      settingsPanel.hidden = true;
      document.body.classList.remove("is-settings-page");
      return;
    }

    const sheet = settingsSurface?.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(12px) scale(.985)" },
      ],
      { duration: 190, easing: "ease-in", fill: "both" },
    );
    settingsPanel.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 210,
      easing: "ease-in",
      fill: "both",
    });
    settingsAnimation = sheet;

    /**
     * Finaliza o fechamento quando a animação vigente termina normalmente.
     *
     * A verificação de identidade impede que uma animação antiga oculte o painel
     * depois que uma animação mais recente já assumiu o controle do estado.
     *
     * @private
     * @returns {void}
     */
    function finishSettingsClose() {
      if (settingsAnimation === sheet) {
        settingsPanel.hidden = true;
        document.body.classList.remove("is-settings-page");
      }
    }

    sheet?.finished.then(
      finishSettingsClose,
      ignoreVisualAnimationCancellation,
    );
  }

  /**
   * Abre o painel de configurações e executa sua animação de entrada.
   *
   * Chamadas são ignoradas quando o painel não existe ou já está aberto.
   *
   * @returns {void}
   */
  function openSettings() {
    if (!settingsPanel || !settingsPanel.hidden) return;
    settingsAnimation?.cancel();
    settingsPanel.hidden = false;
    document.body.classList.add("is-settings-page");
    settingsToggle?.setAttribute("aria-expanded", "true");
    if (motion.matches) return;

    settingsPanel.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 180,
      easing: "ease-out",
      fill: "both",
    });
    settingsAnimation = settingsSurface?.animate(
      [
        { opacity: 0, transform: "translateY(22px) scale(.975)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 420, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" },
    );
  }

  /**
   * Persiste e aplica uma nova fonte escolhida no painel.
   *
   * @returns {void}
   */
  function handleFontChange() {
    localStorage.setItem(storageKeys.font, settingsFont.value);
    setFont(settingsFont.value, true);
  }

  /**
   * Persiste e aplica a textura selecionada para os cartões.
   *
   * @returns {void}
   */
  function handleTextureChange() {
    localStorage.setItem(storageKeys.texture, settingsTexture.value);
    setCardTexture(settingsTexture.value);
  }

  function handleCardBorderChange() {
    localStorage.setItem(storageKeys.border, settingsCardBorder.value);
    setCardBorder(settingsCardBorder.value);
  }

  function handleCardEmojiChange() {
    localStorage.setItem(storageKeys.emoji, settingsCardEmoji.value);
    setCardEmoji(settingsCardEmoji.value);
  }

  /**
   * Persiste a preferência de inclinação e atualiza o efeito visual.
   *
   * @returns {void}
   */
  function handleCardTiltChange() {
    localStorage.setItem(storageKeys.tilt, String(settingsCardTilt.checked));
    setCardTilt(settingsCardTilt.checked);
  }

  /**
   * Persiste e aplica a paleta representada pela opção acionada.
   *
   * @param {MouseEvent} event Evento de clique sobre uma opção de paleta.
   * @returns {void}
   */
  function handlePaletteClick(event) {
    const option = event.currentTarget;
    localStorage.setItem(storageKeys.palette, option.dataset.palette);
    setPalette(option.dataset.palette, true);
  }

  /**
   * Alterna o painel de configurações entre aberto e fechado.
   *
   * @returns {void}
   */
  function handleSettingsToggle() {
    settingsPanel?.hidden ? openSettings() : closeSettings();
  }

  /**
   * Sincroniza o estado visual e ARIA de um botão de aba.
   *
   * @private
   * @param {Element} item Botão de aba a atualizar.
   * @param {Element} activeTabButton Botão considerado ativo.
   * @returns {void}
   */
  function syncSettingsTab(item, activeTabButton) {
    const active = item === activeTabButton;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  }

  /**
   * Ativa a aba de configurações associada ao botão acionado.
   *
   * Atualiza `is-active`, `aria-selected` e a propriedade `hidden` dos painéis,
   * mantendo apenas uma seção de configurações visível por vez.
   *
   * @param {MouseEvent} event Evento de clique no botão de aba.
   * @returns {void}
   */
  function handleSettingsTabClick(event) {
    const tab = event.currentTarget;
    const activeTab = tab.dataset.settingsTab;
    const next = document.querySelector(`#settings-${activeTab}`);
    const current = document.querySelector(
      '.settings-section[role="tabpanel"]:not([hidden])',
    );

    if (!next || next === current) return;

    /**
     * Sincroniza um botão de aba com a aba acionada.
     *
     * @private
     * @param {Element} item Botão de aba candidato.
     * @returns {void}
     */
    function syncCurrentTab(item) {
      syncSettingsTab(item, tab);
    }

    /**
     * Exibe apenas o painel correspondente à aba acionada.
     *
     * @private
     * @param {HTMLElement} panel Painel de configurações candidato.
     * @returns {void}
     */
    document.querySelectorAll("[data-settings-tab]").forEach(syncCurrentTab);
    settingsTabAnimation?.cancel();

    function revealNextPanel() {
      next.hidden = false;
      if (motion.matches) return;

      settingsTabAnimation = next.animate(
        [
          { opacity: 0, transform: "translateX(10px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        { duration: 280, easing: "cubic-bezier(.16, 1, .3, 1)" },
      );
    }

    if (!current) {
      revealNextPanel();
      return;
    }

    if (motion.matches) {
      current.hidden = true;
      revealNextPanel();
      return;
    }

    const exit = current.animate(
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(-8px)" },
      ],
      { duration: 150, easing: "ease-in" },
    );
    settingsTabAnimation = exit;
    exit.finished.then(
      () => {
        if (settingsTabAnimation !== exit) return;
        current.hidden = true;
        revealNextPanel();
      },
      () => {},
    );
  }

  /**
   * Fecha o painel quando o usuário clica diretamente no backdrop.
   *
   * @param {MouseEvent} event Evento de clique recebido pelo painel.
   * @returns {void}
   */
  function handleSettingsBackdropClick(event) {
    if (event.target === settingsPanel) closeSettings();
  }

  /**
   * Salva o perfil local e atualiza a saudação do cabeçalho padrão.
   *
   * @param {SubmitEvent} event Evento de envio do formulário de configurações.
   * @returns {void}
   */
  function handleProfileSubmit(event) {
    event.preventDefault();
    const profile = {
      nickname: profileNickname?.value.trim() || "",
      team: profileTeam?.value || "",
    };
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    defaultHeading.description = profile.nickname
      ? `Olá, ${profile.nickname}. Selecione uma equipe para visualizar os formulários disponíveis.`
      : "Selecione uma equipe para visualizar os formulários disponíveis.";
    event.submitter?.animate(
      [{ opacity: 1 }, { opacity: 0.7, offset: 0.45 }, { opacity: 1 }],
      { duration: 360, easing: "ease-in-out" },
    );
    closeSettings();
  }

  /**
   * Fecha as configurações quando um clique ocorre fora do contêiner `.settings`.
   *
   * @param {MouseEvent} event Evento global de clique.
   * @returns {void}
   */
  function handleDocumentClick(event) {
    if (
      settingsPanel &&
      !settingsPanel.hidden &&
      !event.target.closest(".settings")
    )
      closeSettings();
  }

  /**
   * Fecha o painel de configurações quando a tecla `Escape` é pressionada.
   *
   * @param {KeyboardEvent} event Evento global de teclado.
   * @returns {void}
   */
  function handleDocumentKeydown(event) {
    if (event.key === "Escape" && settingsPanel && !settingsPanel.hidden)
      closeSettings();
  }

  /**
   * Registra o handler de seleção em uma opção de paleta.
   *
   * @private
   * @param {Element} option Opção de paleta a configurar.
   * @returns {void}
   */
  function registerPaletteOption(option) {
    option.addEventListener("click", handlePaletteClick);
  }

  /**
   * Registra o handler de clique em um botão de aba das configurações.
   *
   * @private
   * @param {Element} tab Botão de aba a configurar.
   * @returns {void}
   */
  function registerSettingsTab(tab) {
    tab.addEventListener("click", handleSettingsTabClick);
  }

  settingsFont?.addEventListener("change", handleFontChange);
  settingsTexture?.addEventListener("change", handleTextureChange);
  settingsCardBorder?.addEventListener("change", handleCardBorderChange);
  settingsCardEmoji?.addEventListener("change", handleCardEmojiChange);
  settingsCardTilt?.addEventListener("change", handleCardTiltChange);
  paletteOptions.forEach(registerPaletteOption);
  settingsToggle?.addEventListener("click", handleSettingsToggle);
  settingsClose?.addEventListener("click", closeSettings);
  document.querySelectorAll("[data-settings-tab]").forEach(registerSettingsTab);
  settingsPanel?.addEventListener("click", handleSettingsBackdropClick);
  settingsPanel?.addEventListener("submit", handleProfileSubmit);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
}
