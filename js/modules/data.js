/**
 * Catálogo estático de equipes, templates e metadados usados pelo portal.
 *
 * @module data
 */

/**
 * Define um template de abertura de demanda no GitHub.
 *
 * @typedef {Array} IssueTemplate
 * @property {string} 0 Título exibido ao usuário.
 * @property {string} 1 Descrição resumida do tipo de demanda.
 * @property {string} 2 Nome do arquivo YAML ou URL absoluta para abertura da issue.
 * @property {string} [3] Categoria visual do template; quando ausente, utiliza `Geral`.
 */

/**
 * Metadados de uma equipe exibida no Portal de Demandas.
 *
 * @typedef {Object} Team
 * @property {string} id Identificador estável usado em atributos `data-*` e persistência.
 * @property {string} name Nome legível da equipe.
 * @property {string} emoji Emoji decorativo associado à equipe.
 * @property {string} color Cor de destaque usada por CSS e animações.
 * @property {string} icon Markup SVG do ícone da equipe.
 * @property {string} projectUrl URL da visão correspondente no GitHub Projects.
 * @property {string} description Descrição resumida da responsabilidade da equipe.
 * @property {IssueTemplate[]} templates Templates disponíveis para abertura de demandas.
 */

/**
 * URL-base utilizada para abrir uma nova issue a partir de um template.
 *
 * @type {string}
 * @constant
 */
export const ISSUE_BASE =
  "https://github.com/ti-hu-org/ti-demandas/issues/new?template=";
export const QUALITY_PROJECT_URL =
  "https://github.com/orgs/ti-hu-org/projects/19/views/5";
export const qualityTemplates = [
  [
    "Solicitação de qualidade",
    "Registre uma solicitação para a equipe de Qualidade.",
    "https://github.com/ti-hu-org/ti-qualidade/issues/new?template=solicitacao_qualidade.yml",
    "Qualidade",
  ],
];

/**
 * Ícones SVG internos reutilizados pelos cartões de equipe.
 *
 * @private
 * @type {Record<string, string>}
 */
const icons = {
  support:
    '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5-5L7.4 3.6l3 3-3.8 3.8-3-3L1.3 9.7a4 4 0 0 0 5 5l7.3 7.3 3.4-3.4-7.3-7.3"/><path d="m15 9 6 6"/></svg>',
  bi: '<svg viewBox="0 0 24 24"><path d="M4 20V10m6 10V4m6 16v-7m4 7H1"/><path d="m3 6 5-4 5 4 7-5"/></svg>',
  dev: '<svg viewBox="0 0 24 24"><path d="m8 9-4 3 4 3m8-6 4 3-4 3M14 4l-4 16"/></svg>',
  rpa: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M9 11h.01M15 11h.01M9 15h6M12 7V3m-2 0h4M2 12h2m16 0h2"/></svg>',
};

/**
 * Catálogo ordenado das equipes e de seus respectivos templates de demanda.
 *
 * A ordem desta coleção também determina a ordem inicial de renderização dos
 * cartões no portal.
 *
 * @type {Team[]}
 * @constant
 */
export const teams = [
  {
    id: "suporte",
    name: "Suporte",
    emoji: "🛠️",
    color: "#5b8cff",
    icon: icons.support,
    projectUrl: "https://github.com/orgs/ti-hu-org/projects/6/views/15",
    description:
      "Incidentes, acessos, equipamentos, infraestrutura e atendimento ao usuário.",
    templates: [
      [
        "Telefonia | Solicitação ou ajuste",
        "Solicitação de telefone, carregador ou equipamentos de comunicação.",
        "https://github.com/ti-hu-org/ti-demandas/issues/new?template=30-telefonia.yml",
        "Telefonia",
      ],
      [
        "Solicitação geral",
        "Incidentes, dúvidas, acessos, instalações, equipamentos ou serviços de TI.",
        "01-suporte-solicitacao-geral.yml",
      ],
      [
        "Chamado SAT",
        "Registre um problema encaminhado ao SAT e acompanhe o chamado até a conclusão.",
        "02-suporte-chamado-sat.yml",
      ],
      [
        "Acompanhamento diário SAT",
        "Atualizações, cobranças e pendências dos chamados SAT acompanhados no dia.",
        "03-suporte-acompanhamento-diario-sat.yml",
      ],
      [
        "Registro diário",
        "Demandas e atividades realizadas pela equipe de Suporte durante a semana.",
        "04-suporte-registro-diario.yml",
      ],
    ],
  },
  {
    id: "bi",
    name: "Business Intelligence",
    emoji: "📊",
    color: "#f4ad55",
    icon: icons.bi,
    projectUrl: "https://github.com/orgs/ti-hu-org/projects/6/views/12",
    description:
      "Dashboards, relatórios, indicadores, análises e qualidade dos dados.",
    templates: [
      [
        "Dashboard, relatório ou análise",
        "Dashboards, relatórios, indicadores, análises ou ajustes em dados.",
        "10-bi-dashboard-relatorio-analise.yml",
      ],
      [
        "KPI",
        "Criação, alteração, revisão ou validação de indicadores de desempenho.",
        "11-bi-kpi.yml",
      ],
    ],
  },
  {
    id: "dev",
    name: "Desenvolvimento",
    emoji: "💻",
    color: "#57d99d",
    icon: icons.dev,
    projectUrl: "https://github.com/orgs/ti-hu-org/projects/6/views/13",
    description:
      "Sistemas, APIs, integrações, novas funcionalidades e melhorias técnicas.",
    templates: [
      [
        "Funcionalidade, correção ou integração",
        "Funcionalidades, integrações, melhorias técnicas ou correções em sistemas.",
        "20-dev-funcionalidade-correcao-integracao.yml",
        "Geral",
      ],
      [
        "Setup técnico",
        "Configurações, padronizações e manutenções que não são desenvolvimento de funcionalidade.",
        "21-dev-setup-tecnico.yml",
        "Setup técnico",
      ],
    ],
  },
  {
    id: "rpa",
    name: "RPA",
    emoji: "🤖",
    color: "#a98aff",
    icon: icons.rpa,
    projectUrl: "https://github.com/orgs/ti-hu-org/projects/6/views/14",
    description:
      "Automações, robôs, rotinas operacionais e monitoramento de processos.",
    templates: [
      [
        "Automação ou ajuste",
        "Automações de processos repetitivos, integrações operacionais ou ajustes em robôs.",
        "30-rpa-automacao-ajuste.yml",
      ],
    ],
  },
];
