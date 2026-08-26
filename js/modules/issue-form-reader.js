/**
 * Leitor de GitHub Issue Forms. Busca o YAML pela API Contents do GitHub e
 * monta, localmente, uma experiência de preenchimento integrada ao portal.
 *
 * O portal não armazena credenciais: ao finalizar, o usuário é levado ao
 * formulário nativo do GitHub com título, corpo e metadados preparados.
 *
 * @module issue-form-reader
 */

const page = document.querySelector("#issue-form-dialog");
const portalSurface = document.querySelector(".portal");
const form = document.querySelector("#issue-form");
const title = document.querySelector("#issue-form-title");
const description = document.querySelector("#issue-form-description");
const status = document.querySelector("#issue-form-status");
const closeButton = document.querySelector(".issue-form-page__close");
const githubButton = document.querySelector("#issue-form-github");
const submitButton = document.querySelector("#issue-form-submit");
const preview = document.querySelector("#issue-preview");
const previewContent = document.querySelector("#issue-preview-content");
const viewToggle = document.querySelector(".issue-form-view-toggle");

let current = null;
let leavingPage = false;
const runtimeConfig = window.DEMANDEX_CONFIG || {};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function animateFormElement(element, keyframes, options = {}) {
  if (reducedMotion.matches || !element) return null;
  return element.animate(keyframes, { duration: 460, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both", ...options });
}

function animateFormFields() {
  const fields = [...form.querySelectorAll(".issue-form__field, .issue-form__markdown")];
  fields.forEach((field, index) => animateFormElement(field, [
    { opacity: 0, transform: "translateY(10px)" },
    { opacity: 1, transform: "translateY(0)" },
  ], { delay: Math.min(index * 42, 500) }));
}

function markdownMarkup(value) {
  const escaped = String(value || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const lines = escaped.replace(/\r\n/g, "\n").split("\n");
  const inline = (text) => text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~\n]+)~~/g, "<del>$1</del>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  const output = [];
  let paragraph = [];
  const flushParagraph = () => { if (paragraph.length) { output.push(`<p>${inline(paragraph.join("<br>"))}</p>`); paragraph = []; } };
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flushParagraph(); const level = Math.min(4, heading[1].length + 1); output.push(`<h${level}>${inline(heading[2])}</h${level}>`); index += 1; continue; }
    if (/^&gt;\s?/.test(line)) { flushParagraph(); const quote = []; while (index < lines.length && /^&gt;\s?/.test(lines[index])) quote.push(lines[index++].replace(/^&gt;\s?/, "")); output.push(`<blockquote>${inline(quote.join("<br>"))}</blockquote>`); continue; }
    if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
      flushParagraph(); const ordered = /^\d+\./.test(line); const list = [];
      while (index < lines.length && new RegExp(`^${ordered ? "\\d+\\." : "[-*]"}\\s+`).test(lines[index])) list.push(lines[index++].replace(new RegExp(`^${ordered ? "\\d+\\." : "[-*]"}\\s+`), ""));
      output.push(`<${ordered ? "ol" : "ul"}>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</${ordered ? "ol" : "ul"}>`); continue;
    }
    if (/^\|/.test(line) && lines[index + 1]?.includes("---")) {
      flushParagraph(); const headers = line.split("|").slice(1, -1); index += 2; const rows = [];
      while (index < lines.length && /^\|/.test(lines[index])) rows.push(lines[index++].split("|").slice(1, -1));
      output.push(`<table><thead><tr>${headers.map((cell) => `<th>${inline(cell.trim())}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell.trim())}</td>`).join("")}</tr>`).join("")}</tbody></table>`); continue;
    }
    if (!line.trim()) { flushParagraph(); index += 1; continue; }
    paragraph.push(line); index += 1;
  }
  flushParagraph();
  return output.join("");
}

function markdownSelectionEdit(input, action) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const selected = input.value.slice(start, end);
  const lineStart = input.value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = input.value.indexOf("\n", end);
  const line = input.value.slice(lineStart, lineEnd < 0 ? input.value.length : lineEnd);
  let replacement = selected;
  let cursorStart = start;
  let cursorEnd = end;
  if (action === "heading") replacement = `# ${selected || "Título"}`;
  if (action === "bold") { replacement = `**${selected || "texto em negrito"}**`; cursorStart = start + 2; cursorEnd = cursorStart + (selected || "texto em negrito").length; }
  if (action === "italic") { replacement = `*${selected || "texto em itálico"}*`; cursorStart = start + 1; cursorEnd = cursorStart + (selected || "texto em itálico").length; }
  if (action === "code") { replacement = `\`${selected || "código"}\``; cursorStart = start + 1; cursorEnd = cursorStart + (selected || "código").length; }
  if (action === "link") { replacement = `[${selected || "texto do link"}](https://)`; cursorStart = start + 1; cursorEnd = cursorStart + (selected || "texto do link").length; }
  if (["quote", "unordered", "ordered", "task"].includes(action)) {
    const prefix = { quote: "> ", unordered: "- ", ordered: "1. ", task: "- [ ] " }[action];
    replacement = `${prefix}${line}`;
    input.setSelectionRange(lineStart, lineEnd < 0 ? input.value.length : lineEnd);
    input.setRangeText(replacement, lineStart, lineEnd < 0 ? input.value.length : lineEnd, "select");
    input.setSelectionRange(lineStart + prefix.length, lineStart + replacement.length);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  input.setRangeText(replacement, start, end, "select");
  input.setSelectionRange(cursorStart, cursorEnd);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function refreshMarkdownEditor(editor) {
  const input = editor.querySelector("textarea");
  const output = editor.querySelector("[data-editor-preview]");
  if (input && output) output.innerHTML = markdownMarkup(input.value || "Nada para visualizar ainda.");
}

function setupMarkdownEditor(editor) {
  const input = editor.querySelector("textarea");
  if (!input) return;
  editor.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-editor-tab]");
    if (tab) {
      const previewMode = tab.dataset.editorTab === "preview";
      editor.querySelectorAll("[data-editor-tab]").forEach((button) => {
        const active = button === tab;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });
      editor.querySelectorAll("[data-editor-pane]").forEach((pane) => { pane.hidden = pane.dataset.editorPane !== (previewMode ? "preview" : "write"); });
      editor.querySelectorAll("[data-markdown-action]").forEach((button) => { button.disabled = previewMode; });
      if (previewMode) refreshMarkdownEditor(editor);
      else input.focus();
      return;
    }
    const action = event.target.closest("[data-markdown-action]")?.dataset.markdownAction;
    if (!action) return;
    input.focus();
    markdownSelectionEdit(input, action);
  });
  input.addEventListener("input", () => refreshMarkdownEditor(editor));
  editor.addEventListener("paste", () => requestAnimationFrame(() => refreshMarkdownEditor(editor)));
  refreshMarkdownEditor(editor);
}

function updatePreview() {
  if (!previewContent || !current) return;
  const titleValue = form.querySelector('[name="_title"]')?.value.trim() || current.template.title || "Demanda sem título";
  const body = collectBody();
  previewContent.innerHTML = markdownMarkup(`# ${titleValue}\n\n${body || "Nenhum campo preenchido ainda."}`);
}

function setIssueView(view) {
  const isPreview = view === "preview";
  if (!form || !preview) return;
  form.hidden = isPreview;
  preview.hidden = !isPreview;
  document.body.classList.toggle("is-issue-preview", isPreview);
  viewToggle?.querySelectorAll("[data-issue-view]").forEach((button) => {
    const active = button.dataset.issueView === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (isPreview) updatePreview();
}

function setStatus(message, variant = "") {
  if (!status) return;
  status.textContent = message;
  status.dataset.variant = variant;
  status.hidden = !message;
}

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
    return trimmed.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
  return trimmed;
}

function scalar(value) {
  const text = value.trim();
  if (!text || text === "null" || text === "~") return "";
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+$/.test(text)) return Number(text);
  if (text.startsWith("[") && text.endsWith("]"))
    return text.slice(1, -1).split(",").filter(Boolean).map((item) => unquote(item));
  return unquote(text);
}

function indentation(line) {
  return line.match(/^\s*/)[0].length;
}

/** Analisa o subconjunto do YAML usado pelo schema de Issue Forms do GitHub. */
function parseIssueYaml(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  let cursor = 0;
  const nextContent = () => {
    let index = cursor;
    while (index < lines.length && (!lines[index].trim() || lines[index].trimStart().startsWith("#"))) index += 1;
    return index;
  };

  function parseBlock(level) {
    const next = nextContent();
    if (next >= lines.length || indentation(lines[next]) < level) return {};
    cursor = next;
    const list = lines[cursor].trimStart().startsWith("- ");
    const value = list ? [] : {};

    while (cursor < lines.length) {
      if (!lines[cursor].trim() || lines[cursor].trimStart().startsWith("#")) { cursor += 1; continue; }
      const line = lines[cursor];
      const indent = indentation(line);
      if (indent < level || indent !== level) break;
      const content = line.trim();
      if (list && !content.startsWith("- ")) break;
      if (!list && content.startsWith("- ")) break;

      if (list) {
        const entry = content.slice(2);
        // Valores entre aspas podem conter ':' (por exemplo, "equipe:dev");
        // eles são escalares YAML, não pares chave/valor.
        if ((entry.startsWith('"') && entry.endsWith('"')) || (entry.startsWith("'") && entry.endsWith("'"))) {
          value.push(scalar(entry));
          cursor += 1;
          continue;
        }
        if (/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+$/.test(entry)) {
          value.push(scalar(entry));
          cursor += 1;
          continue;
        }
        if (!entry) { cursor += 1; value.push(parseBlock(level + 2)); continue; }
        const pair = entry.match(/^([^:]+):(?:\s*(.*))?$/);
        if (!pair) { value.push(scalar(entry)); cursor += 1; continue; }
        const item = {};
        const key = pair[1].trim();
        const raw = pair[2] || "";
        cursor += 1;
        item[key] = raw === "|" || raw === ">" ? parseLiteral(level + 2, raw === ">") : raw ? scalar(raw) : parseChild(level + 2);
        const continuationLine = nextContent();
        const continuation =
          continuationLine < lines.length && indentation(lines[continuationLine]) > level
            ? parseBlock(indentation(lines[continuationLine]))
            : {};
        if (continuation && !Array.isArray(continuation)) Object.assign(item, continuation);
        value.push(item);
        continue;
      }

      const pair = content.match(/^([^:]+):(?:\s*(.*))?$/);
      if (!pair) { cursor += 1; continue; }
      const key = pair[1].trim();
      const raw = pair[2] || "";
      cursor += 1;
      value[key] = raw === "|" || raw === ">" ? parseLiteral(level + 2, raw === ">") : raw ? scalar(raw) : parseChild(level + 2);
    }
    return value;
  }

  function parseChild(level) {
    const next = nextContent();
    if (next >= lines.length || indentation(lines[next]) < level) return "";
    cursor = next;
    return parseBlock(level);
  }

  function parseLiteral(level, folded) {
    const content = [];
    while (cursor < lines.length && (!lines[cursor].trim() || indentation(lines[cursor]) >= level)) {
      content.push(lines[cursor].slice(Math.min(level, lines[cursor].length)));
      cursor += 1;
    }
    return folded ? content.join(" ").trim() : content.join("\n").trim();
  }

  return parseBlock(0);
}

function sourceFromIssueUrl(issueUrl) {
  const url = new URL(issueUrl);
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/issues\/new$/);
  const template = url.searchParams.get("template");
  if (!match || !template) throw new Error("O link do template não é compatível com GitHub Issues.");
  return { owner: match[1], repository: match[2], template, issueUrl };
}

async function fetchTemplate(source) {
  const path = `.github/ISSUE_TEMPLATE/${source.template}`;
  const apiBase = (runtimeConfig.githubApiBase || "https://api.github.com").replace(/\/$/, "");
  const endpoint = runtimeConfig.githubProxyUrl
    ? `${runtimeConfig.githubProxyUrl}?${new URLSearchParams({ owner: source.owner, repository: source.repository, path })}`
    : `${apiBase}/repos/${source.owner}/${source.repository}/contents/.github/ISSUE_TEMPLATE/${encodeURIComponent(source.template)}`;
  const response = await fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(response.status === 404
    ? "O GitHub não encontrou o template ou o token do proxy não tem acesso a este repositório."
    : "Não foi possível consultar a API do GitHub.");
  const data = await response.json();
  if (!data.content) throw new Error("A API não retornou o conteúdo do template.");
  const binary = atob(data.content.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function addField(item) {
  const attributes = item.attributes || {};
  if (item.type === "markdown") {
    const note = document.createElement("div");
    note.className = "issue-form__markdown";
    note.innerHTML = markdownMarkup(attributes.value || "");
    form.append(note);
    return;
  }
  if (!item.id || !["input", "textarea", "dropdown", "checkboxes"].includes(item.type)) return;
  const group = document.createElement("div");
  group.className = "issue-form__field";
  group.dataset.fieldId = item.id;
  const label = document.createElement("label");
  label.textContent = attributes.label || item.id;
  const required = item.validations?.required === true;
  if (required) label.insertAdjacentHTML("beforeend", ' <b aria-label="obrigatório">*</b>');
  group.append(label);
  if (attributes.description) { const help = document.createElement("small"); help.textContent = attributes.description; group.append(help); }

  if (item.type === "textarea") {
    const editor = document.createElement("div"); editor.className = "issue-form__markdown-editor";
    const tabs = document.createElement("div"); tabs.className = "issue-form__editor-tabs";
    tabs.innerHTML = '<div class="issue-form__editor-modes" role="tablist"><button type="button" class="is-active" role="tab" aria-selected="true" data-editor-tab="write">Write</button><button type="button" role="tab" aria-selected="false" data-editor-tab="preview">Preview</button></div><div class="issue-form__toolbar" aria-label="Formatação Markdown"><button type="button" data-markdown-action="heading" aria-label="Título">H</button><button type="button" data-markdown-action="bold" aria-label="Negrito"><b>B</b></button><button type="button" data-markdown-action="italic" aria-label="Itálico"><i>I</i></button><button type="button" data-markdown-action="quote" aria-label="Citação">☰</button><button type="button" data-markdown-action="code" aria-label="Código">&lt;&gt;</button><button type="button" data-markdown-action="link" aria-label="Link">↗</button><button type="button" data-markdown-action="unordered" aria-label="Lista">☷</button><button type="button" data-markdown-action="ordered" aria-label="Lista numerada">≣</button><button type="button" data-markdown-action="task" aria-label="Lista de tarefas">☑</button></div>';
    const writePane = document.createElement("div"); writePane.dataset.editorPane = "write";
    const input = document.createElement("textarea"); input.name = item.id; input.placeholder = attributes.placeholder || ""; input.value = attributes.value || ""; input.required = required; writePane.append(input);
    const previewPane = document.createElement("div"); previewPane.dataset.editorPane = "preview"; previewPane.hidden = true;
    const previewOutput = document.createElement("div"); previewOutput.className = "issue-form__editor-preview"; previewOutput.dataset.editorPreview = "true"; previewPane.append(previewOutput);
    const hint = document.createElement("button"); hint.type = "button"; hint.className = "issue-form__editor-hint"; hint.textContent = "📎 Cole, solte ou clique para adicionar arquivos";
    const fileInput = document.createElement("input"); fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.multiple = true; fileInput.hidden = true;
    const attachments = document.createElement("div"); attachments.className = "issue-form__attachments"; editor._attachments = [];
    const addFiles = (files) => {
      [...files].filter((file) => file.type.startsWith("image/")).forEach((file) => {
        if (editor._attachments.some((item) => item.name === file.name && item.size === file.size)) return;
        editor._attachments.push(file);
        const item = document.createElement("span"); item.className = "issue-form__attachment"; item.textContent = `📷 ${file.name}`; attachments.append(item);
      });
      if (editor._attachments.length) setStatus(`${editor._attachments.length} imagem(ns) anexada(s). Elas serão incluídas ao finalizar a demanda.`, "success");
    };
    hint.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => addFiles(fileInput.files));
    editor.addEventListener("dragover", (event) => { event.preventDefault(); editor.classList.add("is-dragging"); });
    editor.addEventListener("dragleave", () => editor.classList.remove("is-dragging"));
    editor.addEventListener("drop", (event) => { event.preventDefault(); editor.classList.remove("is-dragging"); addFiles(event.dataTransfer?.files || []); });
    editor.append(tabs, writePane, previewPane, hint, fileInput, attachments); group.append(editor); setupMarkdownEditor(editor);
  } else if (item.type === "dropdown") {
    if (attributes.multiple === true) {
      group.dataset.requiredMulti = String(required);
      const options = document.createElement("div");
      options.className = "issue-form__multi-options";
      (attributes.options || []).forEach((option) => {
        const row = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = item.id;
        input.value = typeof option === "string" ? option : option.label;
        const text = document.createElement("span");
        text.textContent = input.value;
        row.append(input, text);
        options.append(row);
      });
      group.append(options);
      form.append(group);
      return;
    }
    const input = document.createElement("select"); input.name = item.id; input.required = required;
    if (!input.multiple) { const option = new Option("Selecione uma opção", ""); option.disabled = true; option.selected = true; input.add(option); }
    (attributes.options || []).forEach((option, index) => { const optionNode = new Option(typeof option === "string" ? option : option.label, typeof option === "string" ? option : option.label); optionNode.selected = attributes.default === index; input.add(optionNode); }); group.append(input);
  } else if (item.type === "checkboxes") {
    const options = document.createElement("div"); options.className = "issue-form__checks";
    (attributes.options || []).forEach((option) => { const row = document.createElement("label"); const input = document.createElement("input"); input.type = "checkbox"; input.name = item.id; input.value = option.label || option; input.required = option.required === true; row.append(input, document.createTextNode(option.label || option)); options.append(row); }); group.append(options);
  } else {
    const input = document.createElement("input"); input.type = "text"; input.name = item.id; input.placeholder = attributes.placeholder || ""; input.value = attributes.value || ""; input.required = required; group.append(input);
  }
  form.append(group);
}

function render(template, source, label) {
  current = { template, source };
  title.textContent = template.name || label || "Formulário de demanda";
  description.textContent = template.description || "Preencha os detalhes para preparar a issue.";
  form.replaceChildren();
  const titleGroup = document.createElement("div"); titleGroup.className = "issue-form__field";
  const titleLabel = document.createElement("label"); titleLabel.textContent = "Título da demanda "; const required = document.createElement("b"); required.textContent = "*"; titleLabel.append(required);
  const titleInput = document.createElement("input"); titleInput.name = "_title"; titleInput.required = true; titleInput.value = template.title || ""; titleInput.placeholder = "Descreva a demanda de forma objetiva"; titleGroup.append(titleLabel, titleInput); form.append(titleGroup);
  const assigneeGroup = document.createElement("div"); assigneeGroup.className = "issue-form__field issue-form__assignee";
  const assigneeLabel = document.createElement("label"); assigneeLabel.textContent = "Responsável (opcional)";
  const assigneeHint = document.createElement("small"); assigneeHint.textContent = "Se vazio, o GitHub usará o autor da issue.";
  const assigneeInput = document.createElement("input"); assigneeInput.name = "_assignee"; assigneeInput.placeholder = "Usuário do GitHub (ex.: hu-andrei)";
  try { assigneeInput.value = JSON.parse(localStorage.getItem("ti-demandas-profile") || "{}").githubLogin || ""; } catch { /* perfil indisponível */ }
  assigneeGroup.append(assigneeLabel, assigneeHint, assigneeInput); form.append(assigneeGroup);
  (template.body || []).forEach(addField);
  restoreDraft();
  animateFormFields();
  form.addEventListener("input", handleFormChange);
  form.addEventListener("change", handleFormChange);
  updatePreview();
  setStatus("Formulário carregado da API do GitHub.", "success");
  submitButton.disabled = false; githubButton.disabled = false;
}

function draftKey() {
  return current?.source?.issueUrl ? `demandex-issue-draft:${current.source.issueUrl}` : "";
}

function saveDraft() {
  const key = draftKey();
  if (!key) return;
  const values = {};
  const checks = {};
  form.querySelectorAll("input, textarea, select").forEach((control) => {
    if (!control.name) return;
    if (control.type === "checkbox") {
      (checks[control.name] ||= []).push({ value: control.value, checked: control.checked });
      return;
    }
    values[control.name] = control.multiple
      ? [...control.selectedOptions].map((option) => option.value)
      : control.value;
  });
  try { localStorage.setItem(key, JSON.stringify({ values, checks, savedAt: Date.now() })); } catch { /* armazenamento indisponível */ }
}

function restoreDraft() {
  const key = draftKey();
  if (!key) return;
  let draft;
  try { draft = JSON.parse(localStorage.getItem(key) || "null"); } catch { return; }
  if (!draft) return;
  form.querySelectorAll("input, textarea, select").forEach((control) => {
    if (!control.name) return;
    if (control.type === "checkbox") {
      const saved = draft.checks?.[control.name]?.find((item) => item.value === control.value);
      if (saved) control.checked = saved.checked;
      return;
    }
    if (!(control.name in (draft.values || {}))) return;
    const value = draft.values[control.name];
    if (control.multiple && Array.isArray(value)) [...control.options].forEach((option) => { option.selected = value.includes(option.value); });
    else control.value = value;
  });
}

function handleFormChange() {
  saveDraft();
  updatePreview();
}

function collectBody() {
  return [...form.querySelectorAll(".issue-form__field[data-field-id]")].map((group) => {
    const label = group.querySelector(":scope > label")?.textContent.replace("*", "").trim() || group.dataset.fieldId;
    const control = group.querySelector("textarea, select, input:not([type=checkbox])");
    const value = control ? (control.multiple ? [...control.selectedOptions].map((option) => option.value).join(", ") : control.value) : [...group.querySelectorAll("input:checked")].map((input) => input.value).join(", ");
    const editor = group.querySelector(".issue-form__markdown-editor");
    const attached = editor?._attachments?.length
      ? `\n\nArquivos anexados: ${editor._attachments.map((file) => file.name).join(", ")}`
      : "";
    return `### ${label}\n\n${value || "Não informado"}${attached}`;
  }).join("\n\n");
}

function issueLabels() {
  const rawLabels = current?.template?.labels
    ? (Array.isArray(current.template.labels) ? current.template.labels : [current.template.labels])
    : [];
  const labels = rawLabels
    .flatMap((label) => {
      const name = label && typeof label === "object" ? label.name : label;
      return String(name || "").split(",");
    })
    .map((label) => label.trim())
    .filter((label) => label && label !== "[object Object]");
  return [...new Set(labels)];
}

function issueProjects() {
  const projects = current?.template?.projects
    ? (Array.isArray(current.template.projects) ? current.template.projects : [current.template.projects])
    : [];
  return projects.flatMap((project) => {
    const value = project && typeof project === "object" ? project.name : project;
    return String(value || "").split(",").map((item) => item.trim()).filter((item) => /^[^/]+\/\d+$/.test(item));
  });
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "true");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  const copied = document.execCommand("copy");
  helper.remove();
  if (!copied) throw new Error("Não foi possível copiar o conteúdo.");
}

async function openGithub() {
  if (!current) return;
  const url = new URL(current.source.issueUrl);
  const titleValue = form.querySelector('[name="_title"]')?.value.trim();
  if (titleValue) url.searchParams.set("title", titleValue);
  const body = collectBody();
  const hasAttachments = [...form.querySelectorAll(".issue-form__markdown-editor")]
    .some((editor) => editor._attachments?.length);
  // URLs de criação do GitHub têm limite prático de tamanho. Para formulários
  // longos, copiamos o corpo e abrimos uma URL curta para evitar erro 414.
  const maxPrefillLength = 3500;
  const bodyWillFit = !hasAttachments && `${url}${body ? `&body=${encodeURIComponent(body)}` : ""}`.length <= maxPrefillLength;
  if (body && bodyWillFit) url.searchParams.set("body", body);
  const labels = issueLabels();
  if (labels.length) url.searchParams.set("labels", labels.join(","));
  window.open(url, "_blank", "noopener,noreferrer");
  if (body && !bodyWillFit) {
    try {
      await copyToClipboard(body);
      setStatus(hasAttachments
        ? "Conteúdo copiado. Cole-o no GitHub e anexe as imagens selecionadas no editor da issue."
        : "O formulário é extenso: o conteúdo foi copiado. Cole-o no campo da issue no GitHub.", "success");
    } catch {
      setStatus("A URL foi aberta, mas não foi possível copiar o conteúdo automaticamente. Copie o texto pela visualização.", "error");
    }
  }
}

async function submitToGithub() {
  if (!current) return;
  const proxyUrl = runtimeConfig.githubProxyUrl;
  if (!proxyUrl) return openGithub();
  const body = collectBody();
  const hasAttachments = [...form.querySelectorAll(".issue-form__markdown-editor")]
    .some((editor) => editor._attachments?.length);
  if (hasAttachments) return openGithub();
  const titleValue = form.querySelector('[name="_title"]')?.value.trim() || "Demanda sem título";
  const assignee = form.querySelector('[name="_assignee"]')?.value.trim() || "";
  const labels = issueLabels();
  const projects = issueProjects();
  const endpoint = new URL(proxyUrl.replace(/\/contents(?:\?.*)?$/, "/issues"));
  endpoint.searchParams.set("owner", current.source.owner);
  endpoint.searchParams.set("repository", current.source.repository);
  try {
    const response = await fetch(endpoint.href, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ owner: current.source.owner, repository: current.source.repository, title: titleValue, body, labels, projects, assignees: assignee ? [assignee] : [] }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.html_url) throw new Error(result.error || "O GitHub não aceitou a demanda.");
    window.location.assign(result.html_url);
    setStatus(`Demanda enviada com sucesso (#${result.number}).`, "success");
  } catch (error) {
    setStatus(`${error.message} Você ainda pode abrir o formulário original no GitHub.`, "error");
  }
}

export function createIssueFormReader() {
  function closePage() {
    if (!page) return;
    if (!portalSurface) {
      if (leavingPage) return;
      leavingPage = true;
      const returnTeam = new URLSearchParams(window.location.search).get("returnTeam");
      const destination = new URL("./index.html", window.location.href);
      destination.searchParams.set("fromIssue", "1");
      if (returnTeam) destination.searchParams.set("team", returnTeam);
      const surface = page.querySelector(".issue-form-page__surface");
      if (reducedMotion.matches || !surface) {
        window.location.assign(destination.href);
        return;
      }
      const animation = surface.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(10px)" },
        ],
        { duration: 260, easing: "cubic-bezier(.55, 0, 1, .45)", fill: "both" },
      );
      animation.finished.then(
        () => window.location.assign(destination.href),
        () => window.location.assign(destination.href),
      );
      return;
    }
    page.hidden = true;
    portalSurface?.removeAttribute("hidden");
    document.body.classList.remove("is-issue-form-page");
    document.documentElement.classList.remove("is-issue-form-document");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showPage() {
    if (!page) return;
    portalSurface?.setAttribute("hidden", "");
    page.hidden = false;
    document.body.classList.add("is-issue-form-page");
    document.documentElement.classList.add("is-issue-form-document");
    const surface = page.querySelector(".issue-form-page__surface");
    if (surface && !reducedMotion.matches) {
      surface.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 360, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" },
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  closeButton?.addEventListener("click", closePage);
  viewToggle?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-issue-view]");
    if (button) setIssueView(button.dataset.issueView);
  });
  githubButton?.addEventListener("click", openGithub);
  submitButton?.addEventListener("click", () => {
    const invalidMulti = [...form.querySelectorAll("[data-required-multi='true']")]
      .some((field) => !field.querySelector("input[type=checkbox]:checked"));
    if (!form.reportValidity() || invalidMulti) {
      setStatus("Preencha os campos obrigatórios para continuar.", "error");
      return;
    }
    void submitToGithub();
  });

  async function open({ url, title: label, teamId = "", yaml: prefetchedYaml = null }) {
    if (!page) return window.open(url, "_blank", "noopener,noreferrer");
    showPage(); form.replaceChildren(); title.textContent = label || "Carregando formulário…"; description.textContent = "Consultando o template pela API do GitHub."; setStatus("Carregando campos do formulário…", "loading"); submitButton.disabled = true; githubButton.disabled = false; current = null;
    try { const source = sourceFromIssueUrl(url); source.teamId = teamId || ""; const yaml = prefetchedYaml || await fetchTemplate(source); const template = parseIssueYaml(yaml); if (!template.name && !template.body) throw new Error("O YAML retornado não é um GitHub Issue Form válido."); render(template, source, label); }
    catch (error) {
      setStatus(`${error.message} Você ainda pode abrir o formulário original no GitHub.`, "error");
      form.replaceChildren();
      const message = document.createElement("p");
      message.className = "issue-form__error";
      message.textContent = error.message;
      form.append(message);
      current = { source: { issueUrl: url }, template: {} };
    }
  }
  return { open };
}
