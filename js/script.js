/**
 * Ponto de entrada do Portal de Demandas.
 *
 * Inicializa o controlador principal, restaura preferências persistidas, conecta
 * controles globais, ativa animações e carrega a versão do produto.
 *
 * @module main
 */

import { teams } from "./modules/data.js";
import {
  defaultPortalHeading,
  portalHeadingBack,
  productVersion,
  profileNickname,
  profileTeam,
  root,
  viewSwitcher,
} from "./modules/dom.js";
import { animate, animateDecorations } from "./modules/animations.js";
import { createPortal } from "./modules/portal.js";
import {
  setCardBorder,
  setCardEmoji,
  setCardTexture,
  setCardTilt,
  setFont,
  setPalette,
  setupCardTilt,
  setupSettings,
  storageKeys,
} from "./modules/preferences.js";

const portal = createPortal(defaultPortalHeading);

/**
 * Preenche o seletor de equipe do perfil com as equipes cadastradas no portal.
 *
 * Cada item de `teams` gera uma opção cujo valor corresponde ao identificador
 * estável da equipe e cujo texto corresponde ao nome exibido na interface.
 *
 * @returns {void}
 */
function populateProfileTeams() {
  /**
   * Cria e adiciona ao seletor a opção correspondente a uma equipe.
   *
   * @private
   * @param {Team} team Equipe que será representada no campo de perfil.
   * @returns {void}
   */
  function appendTeamOption(team) {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.name;
    profileTeam?.append(option);
  }

  teams.forEach(appendTeamOption);
}

/**
 * Verifica se um identificador corresponde a uma equipe conhecida.
 *
 * @param {string|undefined|null} teamId Identificador que será validado.
 * @returns {boolean} `true` quando o identificador existe no catálogo `teams`.
 */
function isKnownTeam(teamId) {
  /**
   * Compara uma equipe do catálogo com o identificador procurado.
   *
   * @private
   * @param {Team} team Equipe candidata.
   * @returns {boolean} `true` quando os identificadores coincidem.
   */
  function matchesTeamId(team) {
    return team.id === teamId;
  }

  return teams.some(matchesTeamId);
}

/**
 * Restaura o perfil persistido e sincroniza os campos e o estado do portal.
 *
 * O perfil é lido de `localStorage`. Quando a equipe salva não existe mais no
 * catálogo atual, a seleção é descartada e o portal retorna para a visão geral.
 * O apelido salvo também personaliza a descrição padrão do cabeçalho.
 *
 * @returns {{nickname?: string, team?: string}} Perfil recuperado do armazenamento local.
 * @throws {SyntaxError} Se o conteúdo persistido em `storageKeys.profile` não for JSON válido.
 */
function restoreProfile() {
  const savedProfile = JSON.parse(
    localStorage.getItem(storageKeys.profile) || "{}",
  );

  if (profileNickname) profileNickname.value = savedProfile.nickname || "";
  if (profileTeam)
    profileTeam.value = isKnownTeam(savedProfile.team) ? savedProfile.team : "";

  if (savedProfile.nickname)
    defaultPortalHeading.description = `Olá, ${savedProfile.nickname}. Selecione uma equipe para visualizar os formulários disponíveis.`;

  portal.setOpenTeam(isKnownTeam(savedProfile.team) ? savedProfile.team : null);
  return savedProfile;
}

/**
 * Normaliza a opacidade dos templates quando uma equipe é restaurada já aberta.
 *
 * Essa correção evita que cartões inicialmente renderizados sob uma regra de
 * animação permaneçam transparentes quando o estado aberto vem do perfil salvo.
 *
 * @returns {void}
 */
function revealRestoredTeamTemplates() {
  if (!portal.getOpenTeam()) return;
  /**
   * Torna visível um cartão de template restaurado sem animação de entrada.
   *
   * @private
   * @param {HTMLElement} card Cartão de template restaurado.
   * @returns {void}
   */
  function revealTemplateCard(card) {
    card.style.opacity = "1";
  }

  root
    .querySelectorAll(".team-card.is-open .template-card")
    .forEach(revealTemplateCard);
}

/**
 * Retorna da visão de equipe para a visão geral do portal.
 *
 * @returns {void}
 */
function handlePortalBackClick() {
  const openTeam = portal.getOpenTeam();
  if (openTeam) portal.toggle(openTeam);
}

/**
 * Restaura paleta, fonte, textura e inclinação salvas localmente.
 *
 * Valores ausentes usam os padrões visuais da aplicação. A inclinação é
 * interpretada como habilitada apenas quando o valor persistido é exatamente
 * a string `"true"`.
 *
 * @returns {void}
 */
function restoreAppearancePreferences() {
  setPalette(localStorage.getItem(storageKeys.palette) || "default");
  setFont(localStorage.getItem(storageKeys.font) || "dm-sans");
  setCardTexture(localStorage.getItem(storageKeys.texture) || "none");
  setCardBorder(localStorage.getItem(storageKeys.border) || "none");
  setCardEmoji(localStorage.getItem(storageKeys.emoji) || "default");
  setCardTilt(localStorage.getItem(storageKeys.tilt) === "true");
}

/**
 * Aplica uma visualização válida ao elemento raiz e ao seletor de visualização.
 *
 * @param {"grid"|"list"|"menu"} selected Visualização que deve se tornar ativa.
 * @returns {void}
 */
function applyViewState(selected) {
  root.dataset.view = selected;
  root.classList.toggle("is-list-view", selected === "list");
  root.classList.toggle("is-menu-view", selected === "menu");
  /**
   * Sincroniza um botão do seletor com a visualização ativa.
   *
   * @private
   * @param {Element} item Botão de visualização candidato.
   * @returns {void}
   */
  function syncViewButton(item) {
    const active = item.dataset.view === selected;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  }

  viewSwitcher?.querySelectorAll("[data-view]").forEach(syncViewButton);
}

/**
 * Restaura a visualização persistida anteriormente pelo usuário.
 *
 * Apenas `list` e `menu` precisam ser aplicadas explicitamente na inicialização,
 * pois `grid` já representa o estado padrão definido pelo markup/CSS.
 *
 * @returns {void}
 */
function restoreViewPreference() {
  const savedView = localStorage.getItem(storageKeys.view);
  if (!["list", "menu"].includes(savedView)) return;
  applyViewState(savedView);
}

/**
 * Trata a seleção de uma nova visualização do portal.
 *
 * Valida o valor vindo de `data-view`, impede mudanças redundantes e coordena
 * a transição de saída e entrada entre os layouts.
 *
 * @param {MouseEvent} event Evento de clique disparado por um botão de visualização.
 * @returns {void}
 */
function handleViewButtonClick(event) {
  const button = event.currentTarget;
  const selected = ["grid", "list", "menu"].includes(button.dataset.view)
    ? button.dataset.view
    : "grid";

  if (
    root.dataset.view === selected ||
    root.classList.contains("is-view-transitioning")
  )
    return;

  localStorage.setItem(storageKeys.view, selected);
  root.classList.add("is-view-transitioning");

  const commitViewChange = () => {
    applyViewState(selected);

    requestAnimationFrame(() => {
      animate(
        root,
        [
          { opacity: 0, transform: "translateY(7px) scale(.992)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)" },
      );
      root.classList.remove("is-view-transitioning");
    });
  };

  const exit = animate(
    root,
    [
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(-5px) scale(.994)" },
    ],
    { duration: 150, easing: "ease-in" },
  );
  if (exit) exit.finished.then(commitViewChange, commitViewChange);
  else commitViewChange();
}

/**
 * Registra o clique em todos os botões disponíveis do seletor de visualização.
 *
 * @returns {void}
 */
function setupViewSwitcher() {
  /**
   * Registra o handler de mudança de visualização em um botão.
   *
   * @private
   * @param {Element} button Botão que possui o atributo `data-view`.
   * @returns {void}
   */
  function registerViewButton(button) {
    button.addEventListener("click", handleViewButtonClick);
  }

  viewSwitcher?.querySelectorAll("[data-view]").forEach(registerViewButton);
}

/**
 * Resolve o caminho relativo do arquivo `VERSION` para a página atual.
 *
 * @returns {string} Caminho relativo usado na requisição da versão.
 */
function getVersionPath() {
  return window.location.pathname.includes("/html/") ? "../VERSION" : "VERSION";
}

/**
 * Carrega e exibe a versão do produto a partir do arquivo `VERSION`.
 *
 * Em caso de erro HTTP, falha de rede ou leitura inválida, o elemento de versão
 * passa a exibir `Não disponível` sem interromper a inicialização do restante da
 * aplicação.
 *
 * @returns {Promise<void>} Promise concluída após a tentativa de carregar a versão.
 */
async function loadProductVersion() {
  try {
    const response = await fetch(getVersionPath());
    if (!response.ok) throw new Error(`Falha ao carregar VERSION: ${response.status}`);
    const version = await response.text();
    if (productVersion) productVersion.textContent = `v${version.trim()}`;
  } catch {
    if (productVersion) productVersion.textContent = "Não disponível";
  }
}

/**
 * Inicializa todos os módulos e estados do Portal de Demandas.
 *
 * A ordem é deliberada: primeiro o markup é montado, depois o perfil e o estado
 * visual são restaurados, em seguida os listeners globais são conectados e, por
 * fim, a versão é carregada de forma assíncrona.
 *
 * @returns {void}
 */
function initialize() {
  portal.mount();
  populateProfileTeams();
  restoreProfile();
  portal.applyState();
  revealRestoredTeamTemplates();

  portalHeadingBack?.addEventListener("click", handlePortalBackClick);
  animateDecorations(root);
  restoreAppearancePreferences();
  setupCardTilt();
  setupSettings(portal, defaultPortalHeading);
  restoreViewPreference();
  setupViewSwitcher();
  void loadProductVersion();
}

initialize();
