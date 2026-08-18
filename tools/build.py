"""Gera a versão estática minificada do portal em ``dist/``."""

from pathlib import Path
from shutil import copy2

from rcssmin import cssmin
from rjsmin import jsmin


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


def minify_tree(source: Path, destination: Path, minifier) -> None:
    """Minifica todos os arquivos de uma árvore, preservando sua estrutura."""
    for file_path in source.rglob("*"):
        if not file_path.is_file():
            continue
        target = destination / file_path.relative_to(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(minifier(file_path.read_text(encoding="utf-8")), encoding="utf-8")


def build() -> None:
    """Monta a árvore de publicação com HTML, CSS e JavaScript compactados."""
    minify_tree(ROOT / "css", DIST / "css", cssmin)
    minify_tree(ROOT / "js", DIST / "js", jsmin)

    html = (ROOT / "html" / "index.html").read_text(encoding="utf-8")
    html = html.replace("../css/", "css/").replace("../js/", "js/")
    (DIST / "index.html").write_text(html, encoding="utf-8")
    copy2(ROOT / "VERSION", DIST / "VERSION")


if __name__ == "__main__":
    build()
