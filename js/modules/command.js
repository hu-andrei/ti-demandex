/**
 * Command Palette do DEMANDex.
 *
 * Busca equipes, templates e ações rápidas sem importar a camada visual do
 * projeto de referência. O módulo usa o catálogo atual e mantém a navegação
 * acessível por teclado.
 *
 * @module command
 */

import { ISSUE_BASE, qualityTemplates, teams } from "./data.js";
import {
  commandBackdrop,
  commandInput,
  commandPalette,
  commandResults,
  commandToggle,
  root,
  settingsToggle,
} from "./dom.js";

const RECENT_KEY = "ti-demandas-command-recent";
const MAX_RECENT = 6;

let isOpen = false;
let activeIndex = 0;
let currentItems = [];
let navigateTeam = null;
let paletteAnimation = null;
let backdropAnimation = null;

/**
 * Conecta os eventos e configura as ações do palette.
 *
 * @param {{onNavigateTeam?: (teamId: string) => void}} [options]
 * @returns {void}
 */
export function setupCommandPalette(options = {}) {
  navigateTeam = options.onNavigateTeam || null;

  commandToggle?.addEventListener("click", () => {
    isOpen ? closeCommandPalette() : openCommandPalette();
  });
  commandBackdrop?.addEventListener("click", closeCommandPalette);
  commandInput?.addEventListener("input", handleSearchInput);
  commandInput?.addEventListener("keydown", handleInputKeydown);
  commandResults?.addEventListener("click", handleResultClick);

  document.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === "k") {
      event.preventDefault();
      isOpen ? closeCommandPalette() : openCommandPalette();
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeCommandPalette(false);
    }
  });
}

/** @returns {boolean} */
export function isCommandPaletteOpen() {
  return isOpen;
}

function openCommandPalette() {
  if (!commandPalette || !commandInput || !commandResults) return;
  paletteAnimation?.cancel();
  backdropAnimation?.cancel();
  isOpen = true;
  activeIndex = 0;
  commandPalette.hidden = false;
  if (commandBackdrop) commandBackdrop.hidden = false;
  document.body.classList.add("is-command-open");
  commandInput.value = "";
  renderResults("", true);
  requestAnimationFrame(() => {
    commandPalette.classList.add("is-open");
    commandBackdrop?.classList.add("is-open");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commandInput.focus();
      return;
    }

    paletteAnimation = commandPalette.animate(
      [
        { opacity: 0, transform: "translate(-50%, -18px) scale(.965)" },
        { opacity: 1, transform: "translate(-50%, 0) scale(1)" },
      ],
      { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" },
    );
    if (commandBackdrop) {
      backdropAnimation = commandBackdrop.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 260, easing: "ease-out", fill: "both" },
      );
    }
    commandInput.focus();
  });
}

function closeCommandPalette(restoreFocus = true) {
  if (!isOpen) return;
  isOpen = false;
  paletteAnimation?.cancel();
  backdropAnimation?.cancel();
  commandPalette?.classList.remove("is-open");
  commandBackdrop?.classList.remove("is-open");
  document.body.classList.remove("is-command-open");
  const finish = () => {
    if (isOpen) return;
    if (commandPalette) commandPalette.hidden = true;
    if (commandBackdrop) commandBackdrop.hidden = true;
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    if (restoreFocus) commandToggle?.focus();
    else commandToggle?.blur();
    return;
  }

  paletteAnimation = commandPalette?.animate(
    [
      { opacity: 1, transform: "translate(-50%, 0) scale(1)" },
      { opacity: 0, transform: "translate(-50%, -10px) scale(.98)" },
    ],
    { duration: 190, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "both" },
  );
  backdropAnimation = commandBackdrop?.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 180, easing: "ease-in", fill: "both" },
  );
  paletteAnimation?.finished.then(finish, finish);
  if (restoreFocus) commandToggle?.focus();
  else commandToggle?.blur();
}

function handleSearchInput() {
  activeIndex = 0;
  renderResults(commandInput?.value || "", false);
}

function handleInputKeydown(event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex = Math.min(activeIndex + 1, currentItems.length - 1);
    syncActiveResult();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    syncActiveResult();
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (currentItems[activeIndex]) executeCommand(currentItems[activeIndex]);
  }
}

function handleResultClick(event) {
  const button = event.target.closest("[data-command-id]");
  if (!button) return;
  const item = currentItems.find(
    (candidate) => candidate.id === button.dataset.commandId,
  );
  if (item) executeCommand(item);
}

function syncActiveResult() {
  commandResults
    ?.querySelectorAll("[data-command-id]")
    .forEach((element, index) => {
      const active = index === activeIndex;
      element.classList.toggle("is-active", active);
      element.setAttribute("aria-selected", String(active));
      if (active) {
        commandInput?.setAttribute("aria-activedescendant", element.id);
        element.scrollIntoView({ block: "nearest" });
      }
    });
}

function renderResults(query, shouldAnimate = false) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  currentItems = scoreItems(normalizedQuery);
  if (!commandResults) return;

  if (!currentItems.length) {
    commandResults.innerHTML = `<div class="command-empty">Nenhum resultado para “${escapeHtml(query)}”</div>`;
    commandInput?.removeAttribute("aria-activedescendant");
    return;
  }

  commandResults.innerHTML = currentItems
    .map((item, index) => {
      const itemId = `command-result-${index}`;
      return `<button id="${itemId}" type="button" class="command-item${index === 0 ? " is-active" : ""}"
        data-command-id="${escapeHtml(item.id)}" role="option" aria-selected="${index === 0}">
        <span class="command-item__kind">${kindLabel(item.kind)}</span>
        <span class="command-item__body"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle || "")}</small></span>
        <span class="command-item__meta">${escapeHtml(item.meta || "")}</span>
      </button>`;
    })
    .join("");
  if (shouldAnimate) animateCommandResults();
  commandInput?.setAttribute("aria-activedescendant", "command-result-0");
}

/**
 * Exibe os resultados em uma entrada escalonada, como uma escada visual.
 *
 * @returns {void}
 */
function animateCommandResults() {
  if (
    !commandResults ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  commandResults.querySelectorAll(".command-item").forEach((item, index) => {
    item.animate(
      [
        { opacity: 0, transform: "translateY(12px) translateX(-4px)" },
        { opacity: 1, transform: "translateY(0) translateX(0)" },
      ],
      {
        duration: 260,
        delay: index * 28,
        easing: "cubic-bezier(.16, 1, .3, 1)",
        fill: "both",
      },
    );
  });
}

function scoreItems(query) {
  const items = buildCommandItems();
  if (!query) return items.slice(0, 14);

  return items
    .map((item) => {
      const haystack = [item.title, item.subtitle || "", ...item.keywords]
        .join(" ")
        .toLocaleLowerCase("pt-BR");
      let score = 0;
      if (item.title.toLocaleLowerCase("pt-BR").startsWith(query)) score += 40;
      if (haystack.includes(query)) score += 20;
      query.split(/\s+/).forEach((token) => {
        if (token && haystack.includes(token)) score += 6;
      });
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 14)
    .map((entry) => entry.item);
}

function buildCommandItems() {
  const items = [
    {
      id: "action:settings",
      kind: "action",
      title: "Abrir configurações",
      subtitle: "Preferências, temas e aparência do portal",
      keywords: ["configuração", "configurações", "preferências", "tema"],
      meta: "⚙",
      run: () => {
        closeCommandPalette();
        // O clique original ainda percorre o document após este handler. A
        // abertura no próximo ciclo evita que o listener global de configurações
        // interprete o clique no resultado como um clique externo e feche o painel.
        window.setTimeout(() => settingsToggle?.click(), 0);
      },
    },
    {
      id: "action:overview",
      kind: "action",
      title: "Voltar à visão geral",
      subtitle: "Fechar a equipe selecionada",
      keywords: ["voltar", "início", "equipes", "visão geral"],
      meta: "⌂",
      run: () => {
        closeCommandPalette();
        root?.querySelector(".team-card.is-open .team-toggle")?.click();
      },
    },
  ];

  teams.forEach((team) => {
    items.push({
      id: `team:${team.id}`,
      kind: "team",
      title: team.name,
      subtitle: team.description,
      keywords: [team.id, team.name, team.description],
      meta: `${team.templates.length} ${team.templates.length === 1 ? "template" : "templates"}`,
      run: () => {
        closeCommandPalette();
        navigateTeam?.(team.id);
      },
    });

    team.templates.forEach((template, index) => {
      items.push(createTemplateItem(team, template, index));
    });
  });

  qualityTemplates.forEach((template, index) => {
    items.push(
      createTemplateItem(
        { id: "qualidade", name: "Qualidade", emoji: "✓" },
        template,
        index,
        true,
      ),
    );
  });
  return items;
}

function createTemplateItem(team, template, index, isQuality = false) {
  const [title, description, target, category = "Geral"] = template;
  const url = target.startsWith("http") ? target : `${ISSUE_BASE}${target}`;
  return {
    id: `template:${team.id}:${index}:${isQuality ? "quality" : "team"}`,
    kind: "template",
    title,
    subtitle: `${team.name} · ${category} — ${description}`,
    keywords: [title, description, category, team.name, team.id],
    meta: team.emoji || "↗",
    run: () => {
      saveRecent({ title, teamName: team.name, url, at: Date.now() });
      closeCommandPalette();
      window.open(url, "_blank", "noopener,noreferrer");
    },
  };
}

function saveRecent(item) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [
      item,
      ...stored.filter((entry) => entry.url !== item.url),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // A busca continua funcional mesmo quando o armazenamento está indisponível.
  }
}

function kindLabel(kind) {
  if (kind === "team") return "Equipe";
  if (kind === "action") return "Ação";
  return "Template";
}

function executeCommand(item) {
  item.run();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
