import { createIssueFormReader } from "./modules/issue-form-reader.js";
import { setFont, setPalette, storageKeys } from "./modules/preferences.js";

setPalette(localStorage.getItem(storageKeys.palette) || "default");
setFont(localStorage.getItem(storageKeys.font) || "dm-sans");

const params = new URLSearchParams(window.location.search);
const templateUrl = params.get("templateUrl");
const templateTitle = params.get("title") || "Formulário de demanda";
const reader = createIssueFormReader();
const titleElement = document.querySelector("#issue-form-title");
if (titleElement && params.get("title")) titleElement.textContent = templateTitle;
let prefetchedYaml = null;
try {
  const stored = JSON.parse(sessionStorage.getItem("demandex-prefetched-issue") || "null");
  if (stored?.url === templateUrl) {
    prefetchedYaml = stored.yaml;
    sessionStorage.removeItem("demandex-prefetched-issue");
  }
} catch {
  sessionStorage.removeItem("demandex-prefetched-issue");
}

if (templateUrl) {
  void reader.open({ url: templateUrl, title: templateTitle, teamId: params.get("returnTeam") || "", yaml: prefetchedYaml });
} else {
  const status = document.querySelector("#issue-form-status");
  if (status) status.textContent = "Nenhum template foi selecionado. Volte ao catálogo para escolher um formulário.";
}
