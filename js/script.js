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
      ['Telefonia | Solicitação ou ajuste', 'Solicitação de telefone, carregador ou equipamentos de comunicação.', 'https://github.com/ti-hu-org/ti-demandas/issues/new?template=30-telefonia.yml', 'Telefonia'],
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
      ['Funcionalidade, correção ou integração', 'Funcionalidades, integrações, melhorias técnicas ou correções em sistemas.', '20-dev-funcionalidade-correcao-integracao.yml', 'Geral'],
      ['Setup técnico', 'Configurações, padronizações e manutenções que não são desenvolvimento de funcionalidade.', '21-dev-setup-tecnico.yml', 'Setup técnico']
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
const PROFILE_STORAGE_KEY = 'ti-demandas-profile';
const PALETTE_STORAGE_KEY = 'ti-demandas-palette';
const FONT_STORAGE_KEY = 'ti-demandas-font';
const TEXTURE_STORAGE_KEY = 'ti-demandas-card-texture';
const themeToggle = document.querySelector('.theme-toggle');
const settingsToggle = document.querySelector('.settings-toggle');
const settings = document.querySelector('.settings');
const settingsPanel = document.querySelector('.settings-panel');
const settingsClose = document.querySelector('.settings-close');
const settingsSurface = document.querySelector('.settings-panel__surface');
const settingsFont = document.querySelector('#settings-font');
const settingsTexture = document.querySelector('#settings-texture');
const paletteOptions = document.querySelectorAll('[data-palette]');
const profileNickname = document.querySelector('#profile-nickname');
const profileTeam = document.querySelector('#profile-team');
const productVersion = document.querySelector('#product-version');
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
let settingsAnimation = null;

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
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(.985)' }
  ], { duration: 150, easing: 'ease-in', fill: 'both' }));
  headerAnimations.push(...exitAnimations);

  Promise.all(exitAnimations.map(animation => animation.finished)).then(() => {
    commit();
    const enterAnimations = parts.map(element => element.animate([
      { opacity: 0, transform: 'scale(.985)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 360, delay: 20, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    headerAnimations = enterAnimations;
  }).catch(() => {
    // Uma nova abertura pode cancelar a animação anterior sem gerar erro.
  });
}

function animateHeaderControls() {
  if (motion.matches) return;

  requestAnimationFrame(() => {
    [portalHeadingBack, viewSwitcher]
      .filter(control => control && !control.hidden && getComputedStyle(control).display !== 'none')
      .forEach((control, index) => {
        control.animate([
          { opacity: 0 },
          { opacity: 1 }
        ], {
          duration: 280,
          delay: 70 + index * 45,
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'backwards'
        });
      });
  });
}

function setPalette(palette, animateChange = false) {
  const selected = ['default', 'dracula', 'catppuccin', 'everforest', 'nord', 'tokyo-night', 'gruvbox', 'solarized', 'one-dark', 'rose-pine', 'monokai'].includes(palette) ? palette : 'default';
  const commit = () => {
    document.documentElement.dataset.palette = selected;
    paletteOptions.forEach(option => {
      const active = option.dataset.palette === selected;
      option.classList.toggle('is-active', active);
      option.setAttribute('aria-checked', String(active));
    });
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

function setFont(font, animateChange = false) {
  const selected = ['dm-sans', 'inter', 'manrope', 'space-grotesk', 'outfit', 'plus-jakarta', 'ibm-plex', 'fira-sans', 'source-sans'].includes(font) ? font : 'dm-sans';
  const commit = () => {
    document.documentElement.dataset.font = selected;
    if (settingsFont) settingsFont.value = selected;
  };
  if (!animateChange || motion.matches) {
    commit();
    return;
  }
  const textTargets = document.querySelectorAll([
    'h1', 'h2', 'h3', 'p', 'label', 'option',
    '.portal-heading__title', '.template-number', '.template-count',
    '.team-action', '.popular-demands__label', '.popular-demand',
    '.settings-tab', '.palette-option', '.settings-save'
  ].join(','));
  const fontAnimations = [...textTargets].map(element => element.animate([
    { opacity: 1 },
    { opacity: 0, offset: .5 },
    { opacity: 1 }
  ], { duration: 360, easing: 'ease-in-out', fill: 'both' }));
  setTimeout(commit, 180);
  Promise.all(fontAnimations.map(animation => animation.finished)).catch(() => {});
}

function setCardTexture(texture) {
  const selected = ['none', 'mist', 'grain', 'aurora', 'paper', 'lines', 'glow', 'waves', 'topography'].includes(texture) ? texture : 'none';
  document.documentElement.dataset.cardTexture = selected;
  if (settingsTexture) settingsTexture.value = selected;
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
    emoji: [{ transform: 'translateY(-50%) rotate(-7deg) scale(1)' }, { transform: 'translateY(-54%) rotate(-2deg) scale(1.045)' }, { transform: 'translateY(-50%) rotate(-7deg) scale(1)' }]
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
  const href = file.startsWith('http') ? file : `${ISSUE_BASE}${file}`;
  return `
    <a class="template-card" href="${href}" target="_blank" rel="noreferrer" style="--team-color:${color};--template-order:${index}">
      <div>
        <span class="template-number">TEMPLATE ${String(index + 1).padStart(2, '0')}</span>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <span class="template-arrow" aria-hidden="true">↗</span>
    </a>`;
}

function templateGroupsMarkup(team) {
  const categories = [...new Set(team.templates.map(template => template[3] || 'Geral'))];
  const grouped = categories.map(category => [category, team.templates.filter(template => (template[3] || 'Geral') === category)]);
  let index = 0;
  return grouped.filter(([, templates]) => templates.length).map(([category, templates]) => `
    <section class="template-group">
      ${grouped.length > 1 ? `<h3 class="template-group__title">${category}</h3>` : ''}
      <div class="template-group__cards">${templates.map(template => templateMarkup(template, index++, team.color)).join('')}</div>
    </section>`).join('');
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
            ${templateGroupsMarkup(team)}
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
  if (settingsToggle) {
    settingsToggle.hidden = hasOpenTeam;
    settingsToggle.disabled = hasOpenTeam;
  }
  if (settings) settings.hidden = hasOpenTeam;
  if (portalHeadingBack) {
    portalHeadingBack.hidden = !hasOpenTeam;
    portalHeadingBack.disabled = !hasOpenTeam;
  }
  updatePortalHeading(selectedTeam, hasOpenTeam || wasTeamHeading);
  animateHeaderControls();

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
const savedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
teams.forEach(team => {
  const option = document.createElement('option');
  option.value = team.id;
  option.textContent = team.name;
  profileTeam?.append(option);
});
if (profileNickname) profileNickname.value = savedProfile.nickname || '';
if (profileTeam) profileTeam.value = teams.some(team => team.id === savedProfile.team) ? savedProfile.team : '';
if (savedProfile.nickname) {
  defaultPortalHeading.description = `Olá, ${savedProfile.nickname}. Selecione uma equipe para visualizar os formulários disponíveis.`;
}
openTeam = teams.some(team => team.id === savedProfile.team) ? savedProfile.team : null;
applyState();
if (openTeam) {
  root.querySelectorAll('.team-card.is-open .template-card').forEach(card => {
    card.style.opacity = '1';
  });
}
portalHeadingBack?.addEventListener('click', () => {
  if (openTeam) toggleTeam(openTeam);
});
animateDecorations();
setPalette(localStorage.getItem(PALETTE_STORAGE_KEY) || 'default');
setFont(localStorage.getItem(FONT_STORAGE_KEY) || 'dm-sans');
setCardTexture(localStorage.getItem(TEXTURE_STORAGE_KEY) || 'none');
const versionPath = window.location.pathname.includes('/html/') ? '../VERSION' : 'VERSION';
fetch(versionPath)
  .then(response => response.ok ? response.text() : Promise.reject())
  .then(version => { if (productVersion) productVersion.textContent = `v${version.trim()}`; })
  .catch(() => { if (productVersion) productVersion.textContent = 'Não disponível'; });
settingsFont?.addEventListener('change', () => {
  localStorage.setItem(FONT_STORAGE_KEY, settingsFont.value);
  setFont(settingsFont.value, true);
});
settingsTexture?.addEventListener('change', () => {
  localStorage.setItem(TEXTURE_STORAGE_KEY, settingsTexture.value);
  setCardTexture(settingsTexture.value);
});
paletteOptions.forEach(option => {
  option.addEventListener('click', () => {
    const palette = option.dataset.palette;
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
    setPalette(palette, true);
  });
});
function openSettings() {
  if (!settingsPanel || !settingsPanel.hidden) return;
  settingsAnimation?.cancel();
  settingsPanel.hidden = false;
  document.body.classList.add('is-settings-page');
  settingsToggle?.setAttribute('aria-expanded', 'true');
  settingsToggle?.animate([
    { boxShadow: '0 0 0 rgba(0,0,0,0)', borderColor: 'rgba(255,255,255,.09)' },
    { boxShadow: '0 0 0 4px rgba(203,216,250,.10)', borderColor: 'rgba(203,216,250,.42)' },
    { boxShadow: '0 0 0 rgba(0,0,0,0)', borderColor: 'rgba(255,255,255,.09)' }
  ], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  if (motion.matches) return;
  settingsPanel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out', fill: 'both' });
  settingsAnimation = settingsSurface?.animate([
    { opacity: 0, transform: 'translateY(22px) scale(.975)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
  settingsSurface?.querySelectorAll('.settings-panel__header, .settings-tabs, .settings-section:not([hidden]), .settings-panel__footer')
    .forEach((element, index) => element.animate([
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 300, delay: 90 + index * 55, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
}
settingsToggle?.addEventListener('click', () => {
  if (settingsPanel?.hidden) openSettings();
  else closeSettings();
});
function closeSettings() {
  if (!settingsPanel || settingsPanel.hidden) return;
  settingsToggle?.setAttribute('aria-expanded', 'false');
  settingsToggle?.animate([
    { boxShadow: '0 0 0 4px rgba(203,216,250,.10)' },
    { boxShadow: '0 0 0 rgba(0,0,0,0)' }
  ], { duration: 240, easing: 'ease-out' });
  settingsAnimation?.cancel();
  if (motion.matches) {
    settingsPanel.hidden = true;
    document.body.classList.remove('is-settings-page');
    return;
  }
  const sheet = settingsSurface?.animate([
    { opacity: 1, transform: 'translateY(0) scale(1)' },
    { opacity: 0, transform: 'translateY(12px) scale(.985)' }
  ], { duration: 190, easing: 'ease-in', fill: 'both' });
  settingsPanel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 210, easing: 'ease-in', fill: 'both' });
  settingsAnimation = sheet;
  sheet?.finished.then(() => {
    if (settingsAnimation === sheet) {
      settingsPanel.hidden = true;
      document.body.classList.remove('is-settings-page');
    }
  }, () => {});
}
settingsClose?.addEventListener('click', closeSettings);
document.querySelectorAll('[data-settings-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    const activeTab = tab.dataset.settingsTab;
    const nextPanel = document.querySelector(`#settings-${activeTab}`);
    const currentPanel = document.querySelector('.settings-section[role="tabpanel"]:not([hidden])');
    if (nextPanel === currentPanel) return;

    const activate = () => {
      if (currentPanel) currentPanel.hidden = true;
      if (nextPanel) {
        nextPanel.hidden = false;
        if (!motion.matches) {
          nextPanel.animate([
            { opacity: 0, transform: 'translateX(10px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ], { duration: 280, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
        }
      }
    };

    document.querySelectorAll('[data-settings-tab]').forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    if (!motion.matches) {
      tab.animate([
        { opacity: .55 },
        { opacity: 1 }
      ], { duration: 220, easing: 'ease-out' });
    }
    if (currentPanel && !motion.matches) {
      const exit = currentPanel.animate([
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(-8px)' }
      ], { duration: 150, easing: 'ease-in', fill: 'both' });
      exit.finished.then(activate, activate);
    } else activate();
  });
});
settingsPanel?.addEventListener('click', event => {
  if (event.target === settingsPanel) closeSettings();
});
settingsPanel?.addEventListener('submit', event => {
  event.preventDefault();
  const profile = { nickname: profileNickname?.value.trim() || '', team: profileTeam?.value || '' };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  defaultPortalHeading.description = profile.nickname
    ? `Olá, ${profile.nickname}. Selecione uma equipe para visualizar os formulários disponíveis.`
    : 'Selecione uma equipe para visualizar os formulários disponíveis.';
  event.submitter?.animate([
    { opacity: 1 },
    { opacity: .7, offset: .45 },
    { opacity: 1 }
  ], { duration: 360, easing: 'ease-in-out' });
  closeSettings();
});
document.addEventListener('click', event => {
  if (settingsPanel && !settingsPanel.hidden && !event.target.closest('.settings')) {
    closeSettings();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && settingsPanel && !settingsPanel.hidden) closeSettings();
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
