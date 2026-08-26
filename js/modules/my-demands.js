/** Área de acompanhamento de demandas GitHub e suas sub-issues. */

function statusClass(status) { return status.toLowerCase().replaceAll(" ", "-"); }
function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"); }
function markdownHtml(value) {
  const escaped = escapeHtml(value).replace(/\r\n/g, "\n");
  const normalized = escaped.replace(/\n(?=#{1,6} )/g, "\n\n");
  return normalized.split(/\n{2,}/).map((block) => {
    const heading = block.match(/^(#{1,6}) ([^\n]*)(?:\n([\s\S]*))?$/);
    if (heading) {
      const level = Math.min(4, heading[1].length + 1);
      return `<h${level}>${heading[2]}</h${level}>${heading[3] ? `<p>${heading[3].replace(/\n/g, "<br>")}</p>` : ""}`;
    }
    if (/^&gt; /.test(block)) return `<blockquote>${block.slice(5).replace(/\n/g, "<br>")}</blockquote>`;
    if (/^(?:[-*] |\d+\. )/.test(block)) return `<ul>${block.split("\n").map((line) => `<li>${line.replace(/^(?:[-*] |\d+\. )/, "")}</li>`).join("")}</ul>`;
    return `<p>${block.replace(/\n/g, "<br>")}</p>`;
  }).join("").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function createMyDemands(portal = null) {
  const section = document.querySelector("#my-demands");
  const items = document.querySelector("#my-demands-items");
  const detail = document.querySelector("#my-demands-detail");
  const count = document.querySelector("#my-demands-count");
  const pagination = document.querySelector("#my-demands-pagination");
  const tabs = [...document.querySelectorAll("[data-workspace]")];
  const catalog = document.querySelector("#teams");
  const viewSwitcher = document.querySelector(".view-switcher");
  const search = document.querySelector("#demands-search");
  const searchInput = document.querySelector("#demands-search-input");
  const filterButtons = [...document.querySelectorAll("[data-demand-filter]")];
  let demands = [];
  let selectedId = null;
  let searchTerm = "";
  let filterKind = "all";
  let currentPage = 1;
  const pageSize = 8;
  let message = "Informe seu usuário do GitHub nas Configurações para consultar suas demandas.";

  function selected() { return demands.find((demand) => demand.id === selectedId) || demands[0]; }

  function renderList() {
    const visibleDemands = demands.filter((demand) => {
      const matchesSearch = `${demand.id} ${demand.title} ${demand.team} ${demand.status}`.toLocaleLowerCase().includes(searchTerm);
      const matchesFilter = filterKind === "all" || (filterKind === "subissue" ? demand.isSubissue : !demand.isSubissue);
      return matchesSearch && matchesFilter;
    });
    const totalPages = Math.max(1, Math.ceil(visibleDemands.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const pageDemands = visibleDemands.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    count.textContent = searchTerm ? `${visibleDemands.length}/${demands.length}` : `${demands.length} demandas`;
    if (!visibleDemands.length) {
      pagination.innerHTML = "";
      items.innerHTML = `<p class="my-demands__empty">${searchTerm && demands.length ? `Nenhuma demanda corresponde a “${escapeHtml(searchTerm)}”.` : message}</p>`;
      return;
    }
    items.replaceChildren(...pageDemands.map((demand) => {
      const button = document.createElement("button");
      button.type = "button"; button.className = `my-demand-item ${demand.id === selectedId ? "is-active" : ""}`; button.dataset.demandId = demand.id;
      button.innerHTML = `<span class="my-demand-item__meta"><b>${escapeHtml(demand.id)}</b><i class="demand-status demand-status--${statusClass(demand.status)}">${escapeHtml(demand.status)}</i></span><strong>${escapeHtml(demand.title)}</strong><small>${escapeHtml(demand.team)} · ${escapeHtml(demand.updated)}</small>`;
      return button;
    }));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      [...items.children].forEach((item, index) => item.animate(
        [{ opacity: 0, transform: "translateY(9px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 360, delay: Math.min(index * 42, 360), easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
      ));
    }
    pagination.innerHTML = totalPages > 1 ? `<button type="button" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>‹</button><span>Página ${currentPage} de ${totalPages}</span><button type="button" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>›</button>` : "";
  }

  function renderDetail() {
    const demand = selected();
    if (!demand) { detail.innerHTML = `<div class="my-demands__empty-detail"><span>MINHAS DEMANDAS</span><h2>Nenhuma demanda para exibir</h2><p>${message}</p></div>`; return; }
    detail.innerHTML = `<button class="my-demands__back-list" type="button" data-demand-action="back-list">← Voltar para a lista</button><div class="my-demands__detail-header"><div><span>${escapeHtml(demand.id)} · ${escapeHtml(demand.team)}</span><h2>${escapeHtml(demand.title)}</h2><p>${escapeHtml(demand.updated)}</p></div><i class="demand-status demand-status--${statusClass(demand.status)}">${escapeHtml(demand.status)}</i></div>
      <div class="my-demands__actions"><button type="button" data-demand-action="edit">Editar demanda</button><button type="button" class="is-primary" data-demand-action="add-child">Criar sub-issue <span>+</span></button></div>
      <div class="my-demands__description"><span>DESCRIÇÃO</span><div class="my-demands__description-content">${markdownHtml(demand.description)}</div></div>
      <section class="subissues"><div class="subissues__heading"><span>HIERARQUIA</span><h3>Sub-issues</h3><small>${demand.children.length} ${demand.children.length === 1 ? "item" : "itens"}</small></div><ol class="subissues__tree"><li class="subissues__parent"><span class="subissues__node"></span><div><b>${escapeHtml(demand.id)}</b><strong>${escapeHtml(demand.title)}</strong></div><ol>${demand.children.map((child) => `<li><span class="subissues__branch"></span><div><b>${escapeHtml(child.id)}</b><strong>${escapeHtml(child.title)}</strong><i class="demand-status demand-status--${statusClass(child.status)}">${escapeHtml(child.status)}</i></div></li>`).join("") || '<li class="subissues__empty">Nenhuma sub-issue criada.</li>'}</ol></li></ol></section>`;
  }

  function render() { renderList(); renderDetail(); }

  function issueEndpoint() {
    const proxy = window.DEMANDEX_CONFIG?.githubProxyUrl || "";
    if (!proxy) return "";
    const endpoint = new URL(proxy, window.location.href);
    endpoint.pathname = endpoint.pathname.replace(/\/contents\/?$/, "/issues");
    endpoint.search = "";
    return endpoint.href;
  }

  function mapIssue(issue, repository) {
    const updated = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(issue.updated_at));
    const labels = (issue.labels || []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);
    const isSubissue = labels.some((label) => /(^|[:\s-])sub-?issues?$/i.test(label) || /^type:sub-?issues?$/i.test(label));
    return { id: `#${issue.number}`, title: issue.title, team: repository.split("/")[1], status: issue.state === "closed" ? "Concluída" : "Em andamento", updated: `Atualizada em ${updated}`, updatedAt: issue.updated_at, description: issue.body || "Sem descrição fornecida.", children: [], htmlUrl: issue.html_url, repository, labels, isSubissue };
  }

  async function refreshFromGithub() {
    const profile = JSON.parse(localStorage.getItem("ti-demandas-profile") || "{}");
    const login = String(profile.githubLogin || "").replace(/^@/, "").trim();
    const repositories = window.DEMANDEX_CONFIG?.githubRepositories || [];
    if (!login) { demands = []; selectedId = null; message = "Informe seu usuário do GitHub nas Configurações para consultar suas demandas."; render(); return; }
    if (!repositories.length) { demands = []; selectedId = null; message = "Nenhum repositório foi configurado para consulta."; render(); return; }
    message = "Consultando demandas no GitHub…"; render();
    try {
      const proxy = issueEndpoint();
      const results = await Promise.all(repositories.map(async (repository) => {
        const [owner, name] = repository.split("/");
        const endpoint = proxy
          ? `${proxy}?${new URLSearchParams({ owner, repository: name, creator: login })}`
          : `https://api.github.com/repos/${owner}/${name}/issues?${new URLSearchParams({ state: "all", creator: login, per_page: "100", sort: "updated", direction: "desc" })}`;
        const response = await fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } });
        if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);
        const issues = await response.json();
        return issues.filter((issue) => !issue.pull_request).map((issue) => mapIssue(issue, repository));
      }));
      demands = results.flat().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      selectedId = null;
      message = demands.length ? "" : `Nenhuma issue criada por @${login} foi encontrada nos repositórios configurados.`;
    } catch {
      demands = []; selectedId = null; message = "Não foi possível consultar suas demandas. Verifique seu usuário GitHub e a configuração do proxy.";
    }
    render();
  }

  function animateSwap(from, to) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { from.hidden = true; to.hidden = false; return; }
    from.getAnimations().forEach((animation) => animation.cancel());
    to.getAnimations().forEach((animation) => animation.cancel());
    from.style.opacity = "1";
    from.style.transform = "translateY(0)";
    to.style.opacity = "0";
    to.style.transform = "translateY(12px)";
    const exit = from.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-10px)" }], { duration: 220, easing: "cubic-bezier(.55,0,1,.45)", fill: "both" });
    exit.finished.catch(() => undefined).then(() => {
      from.hidden = true; to.hidden = false;
      to.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" });
    });
  }

  function setWorkspace(workspace) {
    const mine = workspace === "mine";
    if (mine && portal?.getOpenTeam?.()) {
      portal.setOpenTeam(null);
      portal.applyState();
    }
    tabs.forEach((tab) => { const active = tab.dataset.workspace === workspace; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); });
    if (mine && !section.hidden) return;
    if (!mine && !catalog.hidden) return;
    document.body.classList.toggle("is-my-demands", mine);
    document.documentElement.classList.toggle("is-my-demands", mine);
    viewSwitcher.hidden = mine;
    search.hidden = !mine;
    animateSwap(mine ? catalog : section, mine ? section : catalog);
    if (mine) void refreshFromGithub();
  }

  items.addEventListener("click", (event) => {
    const item = event.target.closest("[data-demand-id]"); if (!item) return;
    selectedId = item.dataset.demandId; section.classList.add("has-selection"); render();
    detail.animate([{ opacity: .25, transform: "translateX(10px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 320, easing: "cubic-bezier(.16,1,.3,1)" });
  });

  pagination.addEventListener("click", (event) => {
    const direction = event.target.closest("[data-page]")?.dataset.page;
    if (!direction) return;
    currentPage += direction === "next" ? 1 : -1;
    renderList();
  });

  detail.addEventListener("click", (event) => {
    const action = event.target.closest("[data-demand-action]")?.dataset.demandAction; if (!action) return;
    const demand = selected();
    if (action === "back-list") { selectedId = null; section.classList.remove("has-selection"); render(); return; }
    if (action === "edit") {
      if (demand.htmlUrl) { window.open(demand.htmlUrl, "_blank", "noopener,noreferrer"); return; }
      const next = window.prompt("Edite a descrição da demanda", demand.description);
      if (next === null) return;
      demand.description = next.trim() || demand.description; demand.updated = "Atualizada agora"; render();
    }
    if (action === "add-child") {
      if (demand.htmlUrl) {
        const url = new URL(`${demand.htmlUrl.split("/issues/")[0]}/issues/new`);
        url.searchParams.set("title", `Sub-issue de ${demand.id}: `);
        url.searchParams.set("body", `Relacionada à demanda ${demand.id}: ${demand.title}`);
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      const title = window.prompt("Título da nova sub-issue");
      if (!title?.trim()) return;
      const allIds = demands.flatMap((item) => [item.id, ...item.children.map((child) => child.id)]).map((id) => Number(id.slice(1))).filter(Number.isFinite);
      demand.children.push({ id: `#${Math.max(...allIds, 100) + 1}`, title: title.trim(), status: "Em triagem" });
      demand.updated = "Atualizada agora"; render();
    }
  });

  tabs.forEach((tab) => tab.addEventListener("click", () => setWorkspace(tab.dataset.workspace)));
  searchInput?.addEventListener("input", () => { searchTerm = searchInput.value.trim().toLocaleLowerCase(); currentPage = 1; renderList(); });
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filterKind = button.dataset.demandFilter || "all";
    currentPage = 1;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderList();
  }));
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (!section.hidden) { search.hidden = false; searchInput?.focus(); searchInput?.select(); }
    }
  });
  render();
  return { setWorkspace };
}
