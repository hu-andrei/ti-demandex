/**
 * Utilitários de animação e transição visual do Portal de Demandas.
 *
 * Centraliza o uso da Web Animations API, respeita a preferência de
 * acessibilidade `prefers-reduced-motion` e mantém referências das animações
 * controladas para permitir cancelamento seguro durante mudanças de estado.
 *
 * @module animations
 */

import {
  motion,
  portalHeadingBack,
  portalHeadingIcon,
  portalHeadingTitle,
  portalHeadingDescription,
  viewSwitcher,
} from "./dom.js";

let activeAnimations = [];
let ambientAnimations = [];
let headerAnimations = [];
const defaultHeadingIconMarkup = portalHeadingIcon?.innerHTML || "TI";

/**
 * Cancela uma instância da Web Animations API.
 *
 * Helper compartilhado por operações que precisam interromper coleções de
 * animações sem duplicar callbacks anônimos.
 *
 * @private
 * @param {Animation} animation Instância que deve ser cancelada.
 * @returns {void}
 */
function cancelAnimationInstance(animation) {
  animation.cancel();
}

/**
 * Obtém a Promise de conclusão de uma animação.
 *
 * @private
 * @param {Animation} animation Instância da animação.
 * @returns {Promise<Animation>} Promise resolvida quando a animação termina.
 */

/**
 * Ignora intencionalmente o cancelamento de uma cadeia de animações.
 *
 * Transições visuais podem ser canceladas quando o usuário muda de estado antes
 * do término da animação anterior. Esse cenário é esperado e não representa erro
 * de aplicação.
 *
 * @private
 * @returns {void}
 */

/**
 * Executa uma animação controlada pela aplicação em um elemento.
 *
 * A animação é ignorada quando o usuário solicita redução de movimento. Quando
 * criada, a instância é registrada internamente para que possa ser cancelada por
 * {@link module:animations.cancelAnimations cancelAnimations}. A referência é
 * removida automaticamente quando a animação termina ou é rejeitada/cancelada.
 *
 * @param {Element} element Elemento do DOM que receberá a animação.
 * @param {Keyframe[]|PropertyIndexedKeyframes} keyframes Quadros-chave aceitos por `Element.animate()`.
 * @param {KeyframeAnimationOptions} options Opções da Web Animations API. O módulo força `fill: "both"`, salvo sobrescrita explícita.
 * @returns {Animation|null} Instância criada, ou `null` quando `prefers-reduced-motion` está ativo.
 * @see https://developer.mozilla.org/docs/Web/API/Element/animate
 */
export function animate(element, keyframes, options) {
  if (motion.matches) return null;

  const animation = element.animate(keyframes, { fill: "both", ...options });
  activeAnimations.push(animation);

  /**
   * Verifica se uma animação da coleção é diferente da animação concluída.
   *
   * @private
   * @param {Animation} item Animação candidata da coleção ativa.
   * @returns {boolean} `true` quando a animação deve permanecer registrada.
   */
  function isDifferentAnimation(item) {
    return item !== animation;
  }

  /**
   * Remove da coleção ativa a animação que terminou ou foi cancelada.
   *
   * O mesmo callback é utilizado nos caminhos de resolução e rejeição da Promise
   * `Animation.finished`, garantindo limpeza idempotente em ambos os casos.
   *
   * @private
   * @returns {void}
   */
  function unregisterAnimation() {
    activeAnimations = activeAnimations.filter(isDifferentAnimation);
  }

  animation.finished.then(unregisterAnimation, unregisterAnimation);
  return animation;
}

/**
 * Cancela todas as animações controladas atualmente pelo módulo.
 *
 * Após o cancelamento, a coleção interna é esvaziada. Animações ambientais
 * contínuas não pertencem a esse conjunto e, portanto, não são afetadas.
 *
 * @returns {void}
 */
export function cancelAnimations() {
  activeAnimations.forEach(cancelAnimationInstance);
  activeAnimations = [];
}

/**
 * Faz os controles visíveis do cabeçalho aparecerem suavemente.
 *
 * Atualmente considera o botão de voltar e o seletor de visualização. Controles
 * ausentes, ocultos (`hidden`) ou com `display: none` são ignorados. A execução é
 * adiada para o próximo frame para que estilos e mudanças de layout já estejam
 * aplicados antes da leitura de `getComputedStyle()`.
 *
 * @returns {void}
 */
export function animateHeaderControls() {
  if (motion.matches) return;

  /**
   * Determina se um controle pode participar da animação de entrada.
   *
   * @private
   * @param {Element|null} control Controle candidato.
   * @returns {boolean} `true` quando o controle existe e está visualmente disponível.
   */
  function isVisibleControl(control) {
    return (
      Boolean(control) &&
      !control.hidden &&
      getComputedStyle(control).display !== "none"
    );
  }

  /**
   * Anima individualmente um controle visível do cabeçalho.
   *
   * @private
   * @param {Element} control Controle que receberá o fade de entrada.
   * @param {number} index Posição do controle usada para escalonar o atraso.
   * @returns {void}
   */
  function animateHeaderControl(control, index) {
    control.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 280,
      delay: 70 + index * 45,
      easing: "cubic-bezier(.16, 1, .3, 1)",
      fill: "backwards",
    });
  }

  /**
   * Seleciona os controles atualmente visíveis e inicia suas animações.
   *
   * @private
   * @returns {void}
   */
  function animateVisibleHeaderControls() {
    [portalHeadingBack, viewSwitcher]
      .filter(isVisibleControl)
      .forEach(animateHeaderControl);
  }

  requestAnimationFrame(animateVisibleHeaderControls);
}

/**
 * Atualiza título, descrição, ícone e cor contextual do cabeçalho do portal.
 *
 * Quando uma equipe é informada, seus dados substituem o cabeçalho padrão. Ao
 * voltar para a visão geral, `defaultHeading` é restaurado. Se `animateChange`
 * estiver habilitado, o conteúdo atual realiza uma transição de saída antes da
 * troca e uma transição de entrada após a atualização.
 *
 * @param {Team|null|undefined} team Equipe atualmente selecionada.
 * @param {{title: string, description: string}} defaultHeading Conteúdo usado quando nenhuma equipe está aberta.
 * @param {boolean} [animateChange=false] Define se a troca deve ser animada.
 * @returns {void}
 */
export function updatePortalHeading(
  team,
  defaultHeading,
  animateChange = false,
) {
  const title = team?.name.toUpperCase() || defaultHeading.title;
  const description = team?.description || defaultHeading.description;

  /**
   * Aplica imediatamente o conteúdo calculado aos elementos do cabeçalho.
   *
   * @private
   * @returns {void}
   */
  function commitHeadingContent() {
    if (portalHeadingTitle) portalHeadingTitle.textContent = title;
    if (portalHeadingDescription)
      portalHeadingDescription.textContent = description;
    if (portalHeadingIcon) {
      portalHeadingIcon.innerHTML = team?.icon || defaultHeadingIconMarkup;
      portalHeadingIcon.style.setProperty(
        "--team-color",
        team?.color || "#cbd8fa",
      );
      portalHeadingIcon
        .querySelector("svg")
        ?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
  }

  if (!animateChange || motion.matches) {
    commitHeadingContent();
    return;
  }

  headerAnimations.forEach(cancelAnimationInstance);
  commitHeadingContent();

  const parts = [portalHeadingTitle, portalHeadingDescription].filter(Boolean);

  /**
   * Cria a animação de saída de uma parte do cabeçalho.
   *
   * @private
   * @param {Element} element Parte do cabeçalho que será ocultada.
   * @returns {Animation} Instância da animação de saída.
   */
  /**
   * Cria a animação de entrada de uma parte do cabeçalho.
   *
   * @private
   * @param {Element} element Parte do cabeçalho que reaparecerá.
   * @returns {Animation} Instância da animação de entrada.
   */
  /**
   * Confirma o novo conteúdo e inicia a animação de entrada do cabeçalho.
   *
   * @private
   * @returns {void}
   */
  headerAnimations = parts.map((element, index) =>
    element.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 280,
      delay: 70 + index * 45,
      easing: "cubic-bezier(.16, 1, .3, 1)",
      fill: "backwards",
    }),
  );
}

/**
 * Inicia uma animação ambiental infinita em um elemento.
 *
 * Diferentemente de {@link module:animations.animate animate}, essas animações
 * são armazenadas separadamente e não participam de `cancelAnimations()`, pois
 * representam movimentos decorativos contínuos da interface.
 *
 * @private
 * @param {Element} element Elemento que receberá a animação contínua.
 * @param {Keyframe[]|PropertyIndexedKeyframes} keyframes Quadros-chave da animação.
 * @param {KeyframeAnimationOptions} options Opções adicionais; `iterations` é fixado em `Infinity`.
 * @returns {void}
 */
function animateLoop(element, keyframes, options) {
  if (!motion.matches)
    ambientAnimations.push(
      element.animate(keyframes, {
        fill: "both",
        iterations: Infinity,
        ...options,
      }),
    );
}

/**
 * Inicializa as animações decorativas contínuas dos cartões e do cabeçalho.
 *
 * Procura, dentro de `root`, elementos visuais específicos de cada equipe e
 * aplica movimentos ambientais discretos. Também anima o SVG do ícone principal
 * do cabeçalho quando ele existe. Nenhuma animação é criada em modo de redução
 * de movimento.
 *
 * @param {ParentNode} root Raiz usada para localizar os elementos decorativos dos cartões.
 * @returns {void}
 */
export function animateDecorations(root) {
  const loops = [
    [
      ".team-icon--suporte svg",
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-8deg)" },
        { transform: "rotate(0deg)" },
      ],
      3200,
    ],
    [
      ".team-icon--bi svg path:first-child",
      [
        { transform: "scaleY(.82)", opacity: 0.75 },
        { transform: "scaleY(1)", opacity: 1 },
        { transform: "scaleY(.82)", opacity: 0.75 },
      ],
      2700,
    ],
    [
      ".team-icon--dev svg path:first-child",
      [
        { transform: "scaleX(.88)", opacity: 0.75 },
        { transform: "scaleX(1.08)", opacity: 1 },
        { transform: "scaleX(.88)", opacity: 0.75 },
      ],
      2600,
    ],
    [
      ".team-icon--rpa svg",
      [
        { transform: "rotate(0deg) scale(1)" },
        { transform: "rotate(-1.5deg) scale(1.035)" },
        { transform: "rotate(0deg) scale(1)" },
      ],
      3000,
    ],
    [
      ".team-emoji",
      [
        { transform: "translateY(-50%) rotate(-7deg)" },
        { transform: "translateY(-54%) rotate(-2deg) scale(1.045)" },
        { transform: "translateY(-50%) rotate(-7deg)" },
      ],
      5200,
    ],
  ];

  /**
   * Inicia todas as animações correspondentes a uma configuração decorativa.
   *
   * @private
   * @param {[string, Keyframe[], number]} loop Configuração `[seletor, quadros, duração]`.
   * @returns {void}
   */
  function startDecorationLoop(loop) {
    const [selector, frames, duration] = loop;

    /**
     * Aplica a animação ambiental configurada a um elemento encontrado.
     *
     * @private
     * @param {Element} element Elemento correspondente ao seletor da decoração.
     * @returns {void}
     */
    function animateDecorationElement(element) {
      animateLoop(element, frames, { duration, easing: "ease-in-out" });
    }

    root.querySelectorAll(selector).forEach(animateDecorationElement);
  }

  loops.forEach(startDecorationLoop);

  // Cada SVG possui partes independentes; estas animações devolvem o movimento
  // característico de cada equipe após a separação do módulo.
  const iconFrames = {
    supportGrip: [
      { transform: "scale(1)" },
      { offset: 0.78, transform: "scale(.97)" },
      { offset: 0.88, transform: "scale(1.02)" },
      { transform: "scale(1)" },
    ],
    biLine: [
      { strokeDashoffset: 30, opacity: 0.35 },
      { offset: 0.48, strokeDashoffset: 0, opacity: 1 },
      { offset: 0.78, strokeDashoffset: 0, opacity: 1 },
      { strokeDashoffset: -30, opacity: 0.35 },
    ],
    devSlash: [
      { transform: "rotate(0deg) scale(.92)", opacity: 0.72 },
      { offset: 0.5, transform: "rotate(7deg) scale(1.08)", opacity: 1 },
      { transform: "rotate(0deg) scale(.92)", opacity: 0.72 },
    ],
    rpaFace: [
      { opacity: 1 },
      { offset: 0.47, opacity: 0.18 },
      { offset: 0.49, opacity: 1 },
      { transform: "none", opacity: 1 },
    ],
  };
  root
    .querySelectorAll(".team-icon--suporte svg path:first-child")
    .forEach((element) =>
      animateLoop(element, iconFrames.supportGrip, {
        duration: 3200,
        easing: "ease-in-out",
      }),
    );
  root
    .querySelectorAll(".team-icon--bi svg path:last-child")
    .forEach((element) => {
      element.style.strokeDasharray = 30;
      animateLoop(element, iconFrames.biLine, {
        duration: 2700,
        easing: "ease-in-out",
      });
    });
  root
    .querySelectorAll(".team-icon--dev svg path:last-child")
    .forEach((element) =>
      animateLoop(element, iconFrames.devSlash, {
        duration: 2600,
        easing: "ease-in-out",
      }),
    );
  root
    .querySelectorAll(".team-icon--rpa svg path:nth-child(2)")
    .forEach((element) =>
      animateLoop(element, iconFrames.rpaFace, {
        duration: 3000,
        easing: "steps(1, end)",
      }),
    );

  const portalIcon = document.querySelector(".portal-heading__icon svg");
  if (portalIcon)
    animateLoop(
      portalIcon,
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-1px) rotate(-3deg) scale(1.06)" },
        { transform: "translateY(0)" },
      ],
      { duration: 3000, easing: "ease-in-out" },
    );
}
