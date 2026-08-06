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
let transitionTimer = null;

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

function mountPortal() {
  root.innerHTML = teams.map((team, cardIndex) => `
    <article class="team-card" data-team="${team.id}" style="--team-color:${team.color};--card-order:${cardIndex}">
      <button class="team-toggle" type="button" aria-expanded="false" aria-controls="panel-${team.id}">
        <span class="team-topline">
          <span class="team-icon team-icon--${team.id}">${team.icon}</span>
          <span class="template-count">${team.templates.length} ${team.templates.length === 1 ? 'template disponível' : 'templates disponíveis'}</span>
          <span class="team-emoji" aria-hidden="true">${team.emoji}</span>
          <span class="close-label"><span>×</span> Voltar às equipes</span>
        </span>
        <span class="team-copy">
          <h2>${team.name}</h2>
          <p>${team.description}</p>
        </span>
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
  root.classList.toggle('has-open', hasOpenTeam);

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

  clearTimeout(transitionTimer);
  root.classList.add('is-transitioning');
  openTeam = openTeam === id ? null : id;

  // Aplica todo o novo estado no mesmo frame. Isso impede que um card
  // inativo seja reposicionado para `inset: 0` antes de ser ocultado.
  requestAnimationFrame(() => {
    applyState();
    transitionTimer = window.setTimeout(() => {
      root.classList.remove('is-transitioning');
    }, 620);
  });
}

mountPortal();
applyState();
