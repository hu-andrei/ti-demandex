/**
 * Referências compartilhadas aos elementos do DOM usados pelos demais módulos.
 *
 * As consultas são executadas uma única vez durante a avaliação do módulo. Em
 * páginas onde um elemento opcional não exista, sua referência será `null`.
 *
 * @module dom
 */

/**
 * Elemento raiz que recebe os cartões das equipes.
 *
 * @type {Element|null}
 */
export const root = document.querySelector("#teams");
/**
 * Media query que indica se o usuário prefere redução de movimento.
 *
 * @type {MediaQueryList}
 */
export const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
/**
 * Controle responsável pela troca entre visualizações do portal.
 *
 * @type {Element|null}
 */
export const viewSwitcher = document.querySelector(".view-switcher");
/**
 * Botão que abre ou fecha o painel de configurações.
 *
 * @type {Element|null}
 */
export const settingsToggle = document.querySelector(".settings-toggle");
/**
 * Contêiner principal dos controles de configurações.
 *
 * @type {Element|null}
 */
export const settings = document.querySelector(".settings");
/**
 * Backdrop/painel modal das configurações.
 *
 * @type {Element|null}
 */
export const settingsPanel = document.querySelector(".settings-panel");
/**
 * Botão explícito de fechamento do painel de configurações.
 *
 * @type {Element|null}
 */
export const settingsClose = document.querySelector(".settings-close");
/**
 * Superfície interna animada do painel de configurações.
 *
 * @type {Element|null}
 */
export const settingsSurface = document.querySelector(
  ".settings-panel__surface",
);
/**
 * Campo seletor de fonte.
 *
 * @type {HTMLInputElement|HTMLSelectElement|null}
 */
export const settingsFont = document.querySelector("#settings-font");
/**
 * Campo seletor de textura dos cartões.
 *
 * @type {HTMLInputElement|HTMLSelectElement|null}
 */
export const settingsTexture = document.querySelector("#settings-texture");
export const settingsCardBorder = document.querySelector(
  "#settings-card-border",
);
export const settingsCardEmoji = document.querySelector("#settings-card-emoji");
/**
 * Controle que habilita ou desabilita o efeito de inclinação 3D.
 *
 * @type {HTMLInputElement|null}
 */
export const settingsCardTilt = document.querySelector("#settings-card-tilt");
/**
 * Coleção de opções de paleta disponíveis.
 *
 * @type {NodeListOf<Element>}
 */
export const paletteOptions = document.querySelectorAll("[data-palette]");
/**
 * Campo de apelido do perfil local.
 *
 * @type {HTMLInputElement|HTMLSelectElement|null}
 */
export const profileNickname = document.querySelector("#profile-nickname");
/**
 * Campo de equipe preferencial do perfil local.
 *
 * @type {HTMLInputElement|HTMLSelectElement|null}
 */
export const profileTeam = document.querySelector("#profile-team");
/**
 * Elemento usado para exibir a versão carregada do arquivo `VERSION`.
 *
 * @type {Element|null}
 */
export const productVersion = document.querySelector("#product-version");
/**
 * Contêiner do cabeçalho principal do portal.
 *
 * @type {Element|null}
 */
export const portalHeading = document.querySelector(".portal-heading");
/**
 * Elemento que exibe o ícone contextual do cabeçalho.
 *
 * @type {Element|null}
 */
export const portalHeadingIcon = document.querySelector(
  ".portal-heading__icon",
);
/**
 * Elemento de título do cabeçalho.
 *
 * @type {Element|null}
 */
export const portalHeadingTitle = document.querySelector(
  ".portal-heading__title",
);
/**
 * Elemento de descrição do cabeçalho.
 *
 * @type {Element|null}
 */
export const portalHeadingDescription = document.querySelector(
  ".portal-heading__description",
);
/**
 * Botão de retorno da visão de equipe para a visão geral.
 *
 * @type {Element|null}
 */
export const portalHeadingBack = document.querySelector(
  ".portal-heading__back",
);
/**
 * Grupo de ações exibidas somente quando uma equipe está selecionada.
 *
 * @type {Element|null}
 */
export const portalHeadingTeamActions = document.querySelector(
  ".portal-heading__team-actions",
);
export const teamContextTabs = document.querySelector(".team-context-tabs");
/**
 * Link para a visão da equipe no GitHub Projects.
 *
 * @type {Element|null}
 */
export const portalHeadingProject = document.querySelector(
  ".portal-heading__project",
);
/**
 * Snapshot do texto padrão do cabeçalho no momento da inicialização.
 *
 * É mutável porque o texto de descrição pode ser personalizado pelo perfil
 * salvo localmente.
 *
 * @type {{title: string, description: string}}
 */
export const defaultPortalHeading = {
  title: portalHeadingTitle?.textContent || "PORTAL DE DEMANDAS",
  description: portalHeadingDescription?.textContent || "",
};
