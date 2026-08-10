// Portal de demandas: dados e interações da interface.
const ISSUE_BASE = 'https://github.com/ti-hu-org/ti-demandas/issues/new?template=';

const icons = {
  support: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5-5L7.4 3.6l3 3-3.8 3.8-3-3L1.3 9.7a4 4 0 0 0 5 5l7.3 7.3 3.4-3.4-7.3-7.3"/><path d="m15 9 6 6"/></svg>',
  bi: '<svg viewBox="0 0 24 24"><path d="M4 20V10m6 10V4m6 16v-7m4 7H1"/><path d="m3 6 5-4 5 4 7-5"/></svg>',
  dev: '<svg viewBox="0 0 24 24"><path d="m8 9-4 3 4 3m8-6 4 3-4 3M14 4l-4 16"/></svg>',
  rpa: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M9 11h.01M15 11h.01M9 15h6M12 7V3m-2 0h4M2 12h2m16 0h2"/></svg>'
};

const teams = [
  {
    id: 'suporte', name: 'Suporte', emoji: '🛠️', color: '#5b8cff', icon: icons.support,
    description: 'Incidentes, acessos, equipamentos, infraestrutura e atendimento ao usuário.',
    templates: [
      ['Solicitação geral', 'Incidentes, dúvidas, acessos, instalações, equipamentos ou serviços de TI.', '01-suporte-solicitacao-geral.yml'],
      ['Chamado SAT', 'Registre um problema encaminhado ao SAT e acompanhe o chamado até a conclusão.', '02-suporte-chamado-sat.yml'],
      ['Acompanhamento diário SAT', 'Atualizações, cobranças e pendências dos chamados SAT acompanhados no dia.', '03-suporte-acompanhamento-diario-sat.yml'],
      ['Registro diário', 'Demandas e atividades realizadas pela equipe de Suporte durante a semana.', '04-suporte-registro-diario.yml']
    ]
  },
  {
    id: 'bi', name: 'Business Intelligence', emoji: '📊', color: '#f4ad55', icon: icons.bi,
    description: 'Dashboards, relatórios, indicadores, análises e qualidade dos dados.',
    templates: [
      ['Dashboard, relatório ou análise', 'Dashboards, relatórios, indicadores, análises ou ajustes em dados.', '10-bi-dashboard-relatorio-analise.yml'],
      ['KPI', 'Criação, alteração, revisão ou validação de indicadores de desempenho.', '11-bi-kpi.yml']
    ]
  },
  {
    id: 'dev', name: 'Desenvolvimento', emoji: '💻', color: '#57d99d', icon: icons.dev,
    description: 'Sistemas, APIs, integrações, novas funcionalidades e melhorias técnicas.',
    templates: [
      ['Funcionalidade, correção ou integração', 'Funcionalidades, integrações, melhorias técnicas ou correções em sistemas.', '20-dev-funcionalidade-correcao-integracao.yml'],
      ['Setup técnico', 'Configurações, padronizações e manutenções que não são desenvolvimento de funcionalidade.', '21-dev-setup-tecnico.yml']
    ]
  },
  {
    id: 'rpa', name: 'RPA', emoji: '🤖', color: '#a98aff', icon: icons.rpa,
    description: 'Automações, robôs, rotinas operacionais e monitoramento de processos.',
    templates: [
      ['Automação ou ajuste', 'Automações de processos repetitivos, integrações operacionais ou ajustes em robôs.', '30-rpa-automacao-ajuste.yml']
    ]
  }
];

const root = document.querySelector('#teams');
let openTeam = null;
let activeAnimations = [];
let ambientAnimations = [];

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const viewSwitcher = document.querySelector('.view-switcher');
const VIEW_STORAGE_KEY = 'ti-demandas-view';
const THEME_STORAGE_KEY = 'ti-demandas-theme';
const themeToggle = document.querySelector('.theme-toggle');
const portalHeading = document.querySelector('.portal-heading');
const portalHeadingIcon = document.querySelector('.portal-heading__icon');
const portalHeadingTitle = document.querySelector('.portal-heading__title');
const portalHeadingDescription = document.querySelector('.portal-heading__description');
const portalHeadingBack = document.querySelector('.portal-heading__back');
const defaultPortalHeading = {
  title: portalHeadingTitle?.textContent || 'PORTAL DE DEMANDAS',
  description: portalHeadingDescription?.textContent || ''
};
let headerTransitionFrame = null;
let headerAnimations = [];
let themeAnimation = null;

function updatePortalHeading(team, animateChange = false) {
  const title = team?.name.toUpperCase() || defaultPortalHeading.title;
  const description = team?.description || defaultPortalHeading.description;

  const commit = () => {
    if (portalHeadingTitle) portalHeadingTitle.textContent = title;
    if (portalHeadingDescription) portalHeadingDescription.textContent = description;
    if (portalHeadingIcon) {
      portalHeadingIcon.innerHTML = team?.icon || 'TI';
      portalHeadingIcon.style.setProperty('--team-color', team?.color || '#cbd8fa');
      portalHeadingIcon.querySelector('svg')?.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
  };

  if (!animateChange || motion.matches) {
    commit();
    return;
  }

  headerAnimations.forEach(animation => animation.cancel());
  headerAnimations = [];
  if (headerTransitionFrame) cancelAnimationFrame(headerTransitionFrame);
  const parts = [portalHeadingIcon, portalHeadingTitle, portalHeadingDescription].filter(Boolean);
  const exitAnimations = parts.map(element => element.animate([
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(5px)' }
  ], { duration: 150, easing: 'ease-in', fill: 'both' }));
  headerAnimations.push(...exitAnimations);

  Promise.all(exitAnimations.map(animation => animation.finished)).then(() => {
    commit();
    const enterAnimations = parts.map(element => element.animate([
      { opacity: 0, transform: 'translateY(-5px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 360, delay: 20, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    headerAnimations = enterAnimations;
  }).catch(() => {
    // Uma nova abertura pode cancelar a animação anterior sem gerar erro.
  });
}

function setTheme(theme, animateChange = false) {
  const light = theme === 'light';
  const commit = () => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    themeToggle?.setAttribute('aria-pressed', String(light));
    themeToggle?.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
    themeToggle?.setAttribute('title', light ? 'Ativar modo escuro' : 'Ativar modo claro');
  };

  if (!animateChange || motion.matches) {
    commit();
    return;
  }

  themeAnimation?.cancel();
  document.documentElement.classList.add('is-theme-transitioning');
  themeAnimation = document.documentElement.animate([
    { opacity: 1 },
    { opacity: 0, offset: .5 },
    { opacity: 1 }
  ], { duration: 360, easing: 'ease-in-out', fill: 'both' });
  setTimeout(commit, 180);
  themeAnimation.finished.then(() => {
    document.documentElement.classList.remove('is-theme-transitioning');
  }, () => {
    document.documentElement.classList.remove('is-theme-transitioning');
  });
}

function setView(view) {
  const isList = view === 'list';
  const alreadyActive = root.classList.contains('is-list-view') === isList;
  if (alreadyActive || root.classList.contains('is-view-transitioning')) return;
  localStorage.setItem(VIEW_STORAGE_KEY, view);

  const commitView = () => {
    root.classList.toggle('is-list-view', isList);
    viewSwitcher?.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    requestAnimationFrame(() => {
      animate(root,
        [
          { opacity: 0, transform: 'translateY(7px) scale(.992)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ],
        { duration: 360, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      root.classList.remove('is-view-transitioning');
    });
  };

  root.classList.add('is-view-transitioning');
  cancelAnimations();
  const exit = animate(root,
    [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(-5px) scale(.994)' }
    ],
    { duration: 150, easing: 'ease-in' });
  if (exit) exit.finished.then(commitView);
  else commitView();
}

function cancelAnimations() {
  activeAnimations.forEach(animation => animation.cancel());
  activeAnimations = [];
}

function animateLoop(element, keyframes, options) {
  if (motion.matches) return;
  ambientAnimations.push(element.animate(keyframes, {
    fill: 'both',
    iterations: Infinity,
    ...options
  }));
}

function animateDecorations() {
  const keyframes = {
    supportTool: [{ transform: 'rotate(0deg)' }, { offset: .76, transform: 'rotate(-8deg)' }, { offset: .84, transform: 'rotate(7deg)' }, { offset: .92, transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }],
    supportGrip: [{ transform: 'translate(0, 0)' }, { offset: .78, transform: 'translate(-.6px, .6px)' }, { offset: .88, transform: 'translate(.5px, -.5px)' }, { transform: 'translate(0, 0)' }],
    biBars: [{ transform: 'scaleY(.82)', opacity: .75 }, { offset: .45, transform: 'scaleY(1)', opacity: 1 }, { offset: .72, transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.82)', opacity: .75 }],
    biLine: [{ strokeDashoffset: 30, opacity: .35 }, { offset: .48, strokeDashoffset: 0, opacity: 1 }, { offset: .78, strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: -30, opacity: .35 }],
    devBrackets: [{ transform: 'scaleX(.88)', opacity: .75 }, { offset: .48, transform: 'scaleX(1.08)', opacity: 1 }, { offset: .72, transform: 'scaleX(1.08)', opacity: 1 }, { transform: 'scaleX(.88)', opacity: .75 }],
    devSlash: [{ transform: 'rotate(0deg) scale(.92)', opacity: .72 }, { offset: .5, transform: 'rotate(7deg) scale(1.08)', opacity: 1 }, { transform: 'rotate(0deg) scale(.92)', opacity: .72 }],
    rpaFloat: [{ transform: 'translateY(0) rotate(0deg)' }, { offset: .45, transform: 'translateY(-1.8px) rotate(-1.5deg)' }, { offset: .58, transform: 'translateY(-1.8px) rotate(1.5deg)' }, { transform: 'translateY(0) rotate(0deg)' }],
    rpaFace: [{ opacity: 1 }, { offset: .47, opacity: .18 }, { offset: .49, opacity: 1 }, { transform: 'none', opacity: 1 }],
    emoji: [{ transform: 'translateY(-42%) rotate(-7deg) scale(1)' }, { transform: 'translateY(-48%) rotate(-2deg) scale(1.045)' }, { transform: 'translateY(-42%) rotate(-7deg) scale(1)' }]
  };
  root.querySelectorAll('.team-icon--suporte svg').forEach(el => animateLoop(el, keyframes.supportTool, { duration: 3200, easing: 'ease-in-out' }));
  root.querySelectorAll('.team-icon--suporte svg path:first-child').forEach(el => animateLoop(el, keyframes.supportGrip, { duration: 3200, easing: 'ease-in-out' }));
  root.querySelectorAll('.team-icon--bi svg path:first-child').forEach(el => animateLoop(el, keyframes.biBars, { duration: 2700, easing: 'cubic-bezier(.16, 1, .3, 1)' }));
  root.querySelectorAll('.team-icon--bi svg path:last-child').forEach(el => { el.style.strokeDasharray = 30; animateLoop(el, keyframes.biLine, { duration: 2700, easing: 'ease-in-out' }); });
  root.querySelectorAll('.team-icon--dev svg path:first-child').forEach(el => animateLoop(el, keyframes.devBrackets, { duration: 2600, easing: 'cubic-bezier(.16, 1, .3, 1)' }));
  root.querySelectorAll('.team-icon--dev svg path:last-child').forEach(el => animateLoop(el, keyframes.devSlash, { duration: 2600, easing: 'ease-in-out' }));
  root.querySelectorAll('.team-icon--rpa svg').forEach(el => animateLoop(el, keyframes.rpaFloat, { duration: 3000, easing: 'ease-in-out' }));
  root.querySelectorAll('.team-icon--rpa svg path:nth-child(2)').forEach(el => animateLoop(el, keyframes.rpaFace, { duration: 3000, easing: 'steps(1, end)' }));
  root.querySelectorAll('.team-emoji').forEach(el => animateLoop(el, keyframes.emoji, { duration: 5200, easing: 'ease-in-out' }));
  const portalIcon = document.querySelector('.portal-heading__icon svg');
  if (portalIcon) animateLoop(portalIcon, [
    { transform: 'translateY(0) rotate(0deg) scale(1)' },
    { offset: .45, transform: 'translateY(-1px) rotate(-3deg) scale(1.06)' },
    { offset: .58, transform: 'translateY(-1px) rotate(3deg) scale(1.06)' },
    { transform: 'translateY(0) rotate(0deg) scale(1)' }
  ], { duration: 3000, easing: 'ease-in-out' });
}

function animate(element, keyframes, options) {
  if (motion.matches) return null;
  const animation = element.animate(keyframes, { fill: 'both', ...options });
  activeAnimations.push(animation);
  animation.finished.then(() => {
    activeAnimations = activeAnimations.filter(item => item !== animation);
  }, () => {
    activeAnimations = activeAnimations.filter(item => item !== animation);
  });
  return animation;
}

function templateMarkup(template, index, color) {
  const [title, description, file] = template;
  return `
    <a class="template-card" href="${ISSUE_BASE}${file}" target="_blank" rel="noreferrer" style="--team-color:${color};--template-order:${index}">
      <div>
        <span class="template-number">TEMPLATE ${String(index + 1).padStart(2, '0')}</span>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <span class="template-arrow" aria-hidden="true">↗</span>
    </a>`;
}

function popularMarkup(team) {
  const popular = team.templates.slice(0, team.id === 'suporte' ? 2 : 1);
  return `<div class="popular-demands" aria-label="Demandas mais utilizadas"><span class="popular-demands__label">Mais utilizadas</span><div class="popular-demands__items">${popular.map(([title]) => `<span class="popular-demand">${title}</span>`).join('')}</div></div>`;
}

function mountPortal() {
  root.innerHTML = teams.map((team, cardIndex) => `
    <article class="team-card" data-team="${team.id}" style="--team-color:${team.color};--card-order:${cardIndex}">
      <button class="team-toggle" type="button" aria-expanded="false" aria-controls="panel-${team.id}">
        <span class="team-topline">
          <span class="team-icon team-icon--${team.id}">${team.icon}</span>
          <span class="template-count">${team.templates.length} ${team.templates.length === 1 ? 'template disponível' : 'templates disponíveis'}</span>
          <span class="team-emoji" aria-hidden="true">${team.emoji}</span>
        </span>
        <span class="team-copy">
          <h2>${team.name}</h2>
          <p>${team.description}</p>
        </span>
        ${popularMarkup(team)}
        <span class="team-action">Selecionar equipe <i aria-hidden="true">→</i></span>
      </button>
      <div id="panel-${team.id}" class="team-panel" aria-hidden="true">
        <div class="team-panel-inner">
          <div class="template-grid">
            ${team.templates.map((template, index) => templateMarkup(template, index, team.color)).join('')}
          </div>
        </div>
      </div>
    </article>`).join('');

  root.querySelectorAll('.team-toggle').forEach(button => {
    button.addEventListener('click', () => toggleTeam(button.closest('.team-card').dataset.team));
  });
}

function applyState() {
  const hasOpenTeam = Boolean(openTeam);
  const selectedTeam = teams.find(team => team.id === openTeam);
  const wasTeamHeading = portalHeading?.classList.contains('is-team-heading');
  root.classList.toggle('has-open', hasOpenTeam);
  portalHeading?.classList.toggle('is-team-heading', hasOpenTeam);
  portalHeading?.style.setProperty('--team-color', selectedTeam?.color || '#cbd8fa');
  if (themeToggle) {
    themeToggle.hidden = hasOpenTeam;
    themeToggle.disabled = hasOpenTeam;
  }
  if (portalHeadingBack) {
    portalHeadingBack.hidden = !hasOpenTeam;
    portalHeadingBack.disabled = !hasOpenTeam;
  }
  updatePortalHeading(selectedTeam, hasOpenTeam || wasTeamHeading);

  root.querySelectorAll('.team-card').forEach(card => {
    const isOpen = card.dataset.team === openTeam;
    const button = card.querySelector('.team-toggle');
    const panel = card.querySelector('.team-panel');

    card.classList.toggle('is-open', isOpen);
    card.classList.toggle('is-inactive', hasOpenTeam && !isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));

    // Evita foco acidental em links invisíveis sem desmontar o DOM.
    panel.querySelectorAll('a').forEach(link => {
      link.tabIndex = isOpen ? 0 : -1;
    });
  });
}

function toggleTeam(id) {
  if (root.classList.contains('is-transitioning')) return;

  cancelAnimations();
  root.classList.add('is-transitioning');
  const nextTeam = openTeam === id ? null : id;

  // Faz a troca de layout enquanto o grid está invisível. Isso elimina o
  // frame intermediário em que os cards voltam a ocupar posições antigas.
  const exit = animate(root,
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 150, easing: 'ease-in' });

  const commit = () => {
    openTeam = nextTeam;
    applyState();
    requestAnimationFrame(() => {
      animate(root,
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      if (nextTeam) {
        const panel = root.querySelector(`[data-team="${nextTeam}"] .team-panel`);
        panel.querySelectorAll('.template-card').forEach((card, index) => {
          animate(card,
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 460, delay: 90 + index * 42, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        });
      }
      root.classList.remove('is-transitioning');
    });
  };

  if (exit) exit.finished.then(commit);
  else commit();
}

mountPortal();
applyState();
portalHeadingBack?.addEventListener('click', () => {
  if (openTeam) toggleTeam(openTeam);
});
animateDecorations();
setTheme(localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark');
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  setTheme(nextTheme, true);
});
const savedView = localStorage.getItem(VIEW_STORAGE_KEY);
if (savedView === 'list') {
  root.classList.add('is-list-view');
  viewSwitcher?.querySelector('[data-view="grid"]')?.classList.remove('is-active');
  viewSwitcher?.querySelector('[data-view="grid"]')?.setAttribute('aria-pressed', 'false');
  viewSwitcher?.querySelector('[data-view="list"]')?.classList.add('is-active');
  viewSwitcher?.querySelector('[data-view="list"]')?.setAttribute('aria-pressed', 'true');
}
viewSwitcher?.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

// Só libera a interface depois que a tipografia final estiver disponível.
// O limite evita manter a página oculta caso o provedor de fontes esteja indisponível.
