/**
 * Renderização, estado e navegação do Portal de Demandas.
 *
 * @module portal
 */

/**
 * Controlador retornado por {@link module:portal.createPortal createPortal}.
 *
 * @typedef {Object} PortalController
 * @property {function(): void} mount Renderiza os cartões e registra os eventos principais.
 * @property {function(): void} applyState Sincroniza DOM, acessibilidade e cabeçalho com a equipe aberta.
 * @property {function(string): void} toggle Alterna a abertura da equipe informada.
 * @property {function(string|null): void} setOpenTeam Define programaticamente a equipe aberta sem renderizar o estado.
 * @property {function(): (string|null)} getOpenTeam Retorna o identificador da equipe atualmente aberta.
 */

import {
  ISSUE_BASE,
  QUALITY_PROJECT_URL,
  qualityTemplates,
  teams,
} from "./data.js";
import {
  root,
  portalHeading,
  portalHeadingBack,
  portalHeadingProject,
  portalHeadingTeamActions,
  teamContextTabs,
  settings,
  settingsToggle,
} from "./dom.js";
import {
  animate,
  animateHeaderControls,
  cancelAnimations,
  updatePortalHeading,
} from "./animations.js";

/**
 * Obtém a categoria de um template, usando `Geral` como fallback.
 *
 * @private
 * @param {IssueTemplate} template Template cuja categoria será lida.
 * @returns {string} Categoria explícita ou `Geral`.
 */
function getTemplateCategory(template) {
  return template[3] || "Geral";
}

/**
 * Gera o markup HTML de um cartão de template de demanda.
 *
 * URLs absolutas são preservadas. Para nomes de arquivos YAML, a função monta a
 * URL final usando `ISSUE_BASE`. O índice é utilizado tanto na numeração visível
 * quanto na variável CSS responsável pela ordem de animação.
 *
 * @private
 * @param {IssueTemplate} template Template que será convertido em cartão.
 * @param {number} index Índice global do template dentro da equipe.
 * @param {string} color Cor de destaque da equipe em formato CSS válido.
 * @returns {string} Fragmento HTML do link/cartão do template.
 */
function templateMarkup(template, index, color) {
  const [title, description, file] = template;
  const href = file.startsWith("http") ? file : `${ISSUE_BASE}${file}`;
  return `<a class="template-card" href="${href}" target="_blank" rel="noreferrer" style="--team-color:${color};--template-order:${index}"><div><span class="template-number">TEMPLATE ${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p>${description}</p></div><span class="template-arrow" aria-hidden="true">↗</span></a>`;
}

/**
 * Agrupa os templates de uma equipe por categoria e gera o markup dos grupos.
 *
 * Templates sem categoria explícita são agrupados em `Geral`. A numeração dos
 * cartões permanece contínua entre grupos para manter a ordem visual e de
 * animação consistente.
 *
 * @private
 * @param {Team} team Equipe cujos templates serão agrupados.
 * @returns {string} Markup HTML de todas as seções de templates da equipe.
 */
function templateGroupsMarkup(team) {
  const categories = [...new Set(team.templates.map(getTemplateCategory))];
  let index = 0;

  /**
   * Renderiza uma categoria e todos os templates pertencentes a ela.
   *
   * @private
   * @param {string} category Categoria atual.
   * @returns {string} Markup da seção correspondente.
   */
  function renderCategory(category) {
    /**
     * Verifica se um template pertence à categoria atual.
     *
     * @private
     * @param {IssueTemplate} template Template candidato.
     * @returns {boolean} `true` quando o template pertence à categoria.
     */
    function belongsToCategory(template) {
      return getTemplateCategory(template) === category;
    }

    /**
     * Renderiza um template mantendo a numeração contínua entre categorias.
     *
     * @private
     * @param {IssueTemplate} template Template que será convertido em cartão.
     * @returns {string} Markup do cartão renderizado.
     */
    function renderTemplate(template) {
      const markup = templateMarkup(template, index, team.color);
      index += 1;
      return markup;
    }

    const templates = team.templates.filter(belongsToCategory);
    const title = `<h3 class="template-group__title">${category}</h3>`;
    return `<section class="template-group">${title}<div class="template-group__cards">${templates.map(renderTemplate).join("")}</div></section>`;
  }

  return categories.map(renderCategory).join("");
}

/**
 * Gera a faixa de demandas mais utilizadas exibida no cartão de uma equipe.
 *
 * A equipe de Suporte destaca os dois primeiros templates; as demais equipes
 * destacam apenas o primeiro. A seleção é posicional e depende da ordem definida
 * em `teams`.
 *
 * @private
 * @param {Team} team Equipe usada para selecionar os templates em destaque.
 * @returns {string} Markup HTML da faixa de demandas populares.
 */
function popularMarkup(team) {
  const popular = team.templates.slice(0, team.id === "suporte" ? 2 : 1);

  /**
   * Renderiza o rótulo compacto de uma demanda popular.
   *
   * @private
   * @param {IssueTemplate} template Template destacado.
   * @returns {string} Markup do rótulo da demanda.
   */
  function renderPopularDemand(template) {
    const [title] = template;
    return `<span class="popular-demand">${title}</span>`;
  }

  return `<div class="popular-demands" aria-label="Demandas mais utilizadas"><span class="popular-demands__label">Mais utilizadas</span><div class="popular-demands__items">${popular.map(renderPopularDemand).join("")}</div></div>`;
}

/**
 * Cria o controlador responsável pelo ciclo de vida visual do portal.
 *
 * O controlador mantém em closure o identificador da equipe aberta e expõe
 * operações para montar a interface, aplicar o estado atual e alternar equipes.
 * A função não monta automaticamente o portal; o chamador deve executar
 * {@link PortalController#mount mount}.
 *
 * @param {{title: string, description: string}} defaultHeading Cabeçalho usado na visão geral do portal.
 * @returns {PortalController} API de controle do portal.
 */
export function createPortal(defaultHeading) {
  let openTeam = null;
  let activeContext = "team";

  /**
   * Trata o clique no botão principal de um cartão de equipe.
   *
   * Obtém o identificador da equipe a partir do cartão ancestral do botão e
   * delega a mudança de estado para `toggle`.
   *
   * @param {MouseEvent} event Evento de clique disparado pelo botão da equipe.
   * @returns {void}
   */
  function handleTeamToggleClick(event) {
    const button = event.currentTarget;
    const teamId = button.closest(".team-card")?.dataset.team;
    if (teamId) toggle(teamId);
  }

  /**
   * Renderiza um cartão completo de equipe.
   *
   * @private
   * @param {Team} team Equipe que será exibida.
   * @param {number} cardIndex Índice visual do cartão.
   * @returns {string} Markup completo do cartão de equipe.
   */
  function renderTeamCard(team, cardIndex) {
    const quality = { ...team, templates: qualityTemplates };
    return `<article class="team-card" data-team="${team.id}" style="--team-color:${team.color};--card-order:${cardIndex}"><button class="team-toggle" type="button" aria-expanded="false" aria-controls="panel-${team.id}"><span class="team-topline"><span class="team-icon team-icon--${team.id}">${team.icon}</span><span class="team-index" aria-hidden="true">${String(cardIndex + 1).padStart(2, "0")}</span><span class="template-count">${team.templates.length} ${team.templates.length === 1 ? "template disponível" : "templates disponíveis"}</span><span class="team-emoji" aria-hidden="true">${team.emoji}</span></span><span class="team-copy"><h2>${team.name}</h2><p>${team.description}</p></span>${popularMarkup(team)}<span class="team-action">Selecionar equipe <i aria-hidden="true">→</i></span></button><div id="panel-${team.id}" class="team-panel" aria-hidden="true"><div class="team-panel-inner"><div class="template-grid" data-template-context="team">${templateGroupsMarkup(team)}</div><div class="template-grid" data-template-context="quality" hidden>${templateGroupsMarkup(quality)}</div></div></div></article>`;
  }

  /**
   * Registra o handler de clique de um botão de equipe recém-renderizado.
   *
   * @private
   * @param {Element} button Botão `.team-toggle`.
   * @returns {void}
   */
  function registerTeamToggleButton(button) {
    button.addEventListener("click", handleTeamToggleClick);
  }

  /**
   * Renderiza os cartões de equipe e registra o clique de abertura/fechamento.
   *
   * O conteúdo atual de `root` é substituído integralmente. Cada botão criado é
   * associado à equipe do cartão pai e encaminha a interação para `toggle`.
   *
   * @returns {void}
   */
  function mount() {
    root.innerHTML = teams.map(renderTeamCard).join("");
    root.querySelectorAll(".team-toggle").forEach(registerTeamToggleButton);
    document.querySelectorAll("[data-team-context]").forEach((button) =>
      button.addEventListener("click", () => {
        const nextContext =
          button.dataset.teamContext === "quality" ? "quality" : "team";
        if (nextContext === activeContext) return;
        const previousContext = activeContext;
        activeContext = nextContext;
        applyState(false, false);
        animateContextChange(previousContext, nextContext);
      }),
    );
  }

  /**
   * Sincroniza a interface com o valor atual de `openTeam`.
   *
   * Atualiza classes CSS, atributos ARIA, disponibilidade dos controles, link do
   * GitHub Project, cabeçalho contextual e `tabIndex` dos links de templates.
   * Também dispara as animações dos controles do cabeçalho.
   *
   * @returns {void}
   */
  function applyState(updateHeader = true, updateTemplates = true) {
    const hasOpenTeam = Boolean(openTeam);

    /**
     * Verifica se uma equipe corresponde ao identificador atualmente aberto.
     *
     * @private
     * @param {Team} team Equipe candidata.
     * @returns {boolean} `true` quando a equipe é a equipe aberta.
     */
    function isSelectedTeam(team) {
      return team.id === openTeam;
    }

    const selectedTeam = teams.find(isSelectedTeam);
    const wasTeamHeading = portalHeading?.classList.contains("is-team-heading");
    root.classList.toggle("has-open", hasOpenTeam);
    portalHeading?.classList.toggle("is-team-heading", hasOpenTeam);
    portalHeading?.style.setProperty(
      "--team-color",
      selectedTeam?.color || "#cbd8fa",
    );

    if (settingsToggle) {
      settingsToggle.hidden = hasOpenTeam;
      settingsToggle.disabled = hasOpenTeam;
    }
    if (settings) settings.hidden = hasOpenTeam;
    if (portalHeadingBack) portalHeadingBack.disabled = !hasOpenTeam;
    if (portalHeadingTeamActions)
      portalHeadingTeamActions.hidden = !hasOpenTeam;
    if (teamContextTabs) teamContextTabs.hidden = !hasOpenTeam;
    if (portalHeadingProject && selectedTeam)
      portalHeadingProject.href =
        activeContext === "quality"
          ? QUALITY_PROJECT_URL
          : selectedTeam.projectUrl;

    document.querySelectorAll("[data-team-context]").forEach((button) => {
      const active = button.dataset.teamContext === activeContext;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });

    if (updateHeader) {
      updatePortalHeading(
        selectedTeam,
        defaultHeading,
        hasOpenTeam || wasTeamHeading,
      );
      animateHeaderControls();
    }

    /**
     * Sincroniza acessibilidade e aparência de um cartão com o estado aberto.
     *
     * @private
     * @param {Element} card Cartão de equipe a atualizar.
     * @returns {void}
     */
    function syncTeamCard(card) {
      const isOpen = card.dataset.team === openTeam;
      card.classList.toggle("is-open", isOpen);
      card.classList.toggle("is-inactive", hasOpenTeam && !isOpen);
      if (isOpen) card.style.removeProperty("transform");
      card
        .querySelector(".team-toggle")
        .setAttribute("aria-expanded", String(isOpen));

      const panel = card.querySelector(".team-panel");
      panel.setAttribute("aria-hidden", String(!isOpen));
      if (updateTemplates)
        card.querySelectorAll("[data-template-context]").forEach((grid) => {
          grid.hidden = grid.dataset.templateContext !== activeContext;
        });

      /**
       * Ajusta a navegabilidade de um link de template conforme o painel aberto.
       *
       * @private
       * @param {HTMLAnchorElement} link Link de template.
       * @returns {void}
       */
      function syncTemplateLink(link) {
        link.tabIndex = isOpen ? 0 : -1;
      }

      panel.querySelectorAll("a").forEach(syncTemplateLink);
    }

    root.querySelectorAll(".team-card").forEach(syncTeamCard);
  }

  function animateContextChange(previousContext, nextContext) {
    const card = root.querySelector(`[data-team="${openTeam}"]`);
    const previous = card?.querySelector(
      `[data-template-context="${previousContext}"]`,
    );
    const next = card?.querySelector(
      `[data-template-context="${nextContext}"]`,
    );
    if (!next) return;

    const reveal = () => {
      next.hidden = false;
      animate(
        next,
        [
          { opacity: 0, transform: "translateX(12px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        { duration: 280, easing: "cubic-bezier(.16, 1, .3, 1)" },
      );
    };

    if (!previous) {
      reveal();
      return;
    }

    const exit = animate(
      previous,
      [
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(-10px)" },
      ],
      { duration: 150, easing: "ease-in" },
    );
    if (exit)
      exit.finished.then(
        () => {
          previous.hidden = true;
          reveal();
        },
        () => {
          previous.hidden = true;
          reveal();
        },
      );
    else {
      previous.hidden = true;
      reveal();
    }
  }

  /**
   * Alterna a equipe aberta de forma imediata.
   *
   * Se a equipe informada já estiver aberta, a visão geral passa a ser o próximo
   * estado. A atualização não cria animações nos cards, inclusive no modo lista.
   *
   * @param {string} id Identificador da equipe a abrir ou fechar.
   * @returns {void}
   */
  function toggle(id) {
    if (root.classList.contains("is-transitioning")) return;

    cancelAnimations();
    root.classList.add("is-transitioning");
    const nextTeam = openTeam === id ? null : id;
    activeContext = "team";

    const commit = () => {
      openTeam = nextTeam;
      applyState();

      requestAnimationFrame(() => {
        animate(root, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 420,
          easing: "cubic-bezier(.16, 1, .3, 1)",
        });

        if (nextTeam) {
          root
            .querySelector(`[data-team="${nextTeam}"] .team-panel`)
            .querySelectorAll(".template-card")
            .forEach((card, index) => {
              animate(card, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 460,
                delay: 90 + index * 42,
                easing: "cubic-bezier(.16, 1, .3, 1)",
              });
            });
        }

        root.classList.remove("is-transitioning");
      });
    };

    const exit = animate(root, [{ opacity: 1 }, { opacity: 0 }], {
      duration: 150,
      easing: "ease-in",
    });
    if (exit) exit.finished.then(commit, commit);
    else commit();
  }

  /**
   * Define a equipe aberta no estado interno sem aplicar alterações ao DOM.
   *
   * Use `applyState()` após esta operação quando a interface já estiver montada.
   *
   * @param {string|null} teamId Identificador da equipe, ou `null` para a visão geral.
   * @returns {void}
   */
  function setOpenTeam(teamId) {
    openTeam = teamId;
  }

  /**
   * Obtém a equipe atualmente aberta no estado interno.
   *
   * @returns {string|null} Identificador da equipe aberta, ou `null` na visão geral.
   */
  function getOpenTeam() {
    return openTeam;
  }

  return {
    mount,
    applyState,
    toggle,
    setOpenTeam,
    getOpenTeam,
  };
}
