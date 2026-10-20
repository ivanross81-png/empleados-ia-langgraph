#!/usr/bin/env python3
"""Validador: las rutas documentadas existen. Solo lee.

Extrae de los .md del paquete las menciones entre backticks que *parecen* una ruta
del repositorio (`docs/...`, `algo.md`, `tools/...`) y verifica que existan.
No valida que el contenido de la ruta sea el correcto: eso es revisión humana.

Uso: python3 tools/docs-verify/check_paths.py [repo]
"""
import os
import re
import sys

ROOT_MD = {
    "README.md",
    "00-INDEX.md",
    "DOCUMENT-MANIFEST.md",
    "EXPLICACION-NO-TECNICA.md",
}
# Menciones deliberadas que NO son rutas vigentes y no deben reportarse:
#  - docs/DOCUMENT-MANIFEST.md: ruta defectuosa citada a propósito en los registros
#    de auditoría y verificación que describen el defecto histórico;
#  - .github/workflows/docs-verify.yml: workflow **preparado y pendiente de publicar**
#    (el token de publicación no tiene el alcance `workflow`). La documentación lo
#    nombra para dejarlo trazado; el archivo se publica cuando exista ese permiso.
IGNORAR = {
    "docs/DOCUMENT-MANIFEST.md",
    ".github/workflows/docs-verify.yml",
}
TOKEN = re.compile(r"`([^`]+)`")


def candidate(token: str) -> bool:
    t = token.strip()
    if not t or any(c in t for c in ("§", " ", "*", "\t", "|", "<", ">", "…")):
        return False
    if t.startswith(("http://", "https://", "www.")):
        return False
    # rangos documentados (p. ej. `docs/architecture/00-10`) no son rutas
    base = os.path.basename(t)
    if ".." in t or re.fullmatch(r"\d+-\d+", base):
        return False
    # solo la disposición de ESTE repositorio: lo demás (rutas de Kortix/Suna,
    # del anexo supersedido o de otros proyectos) es material comparativo
    return t.startswith(("docs/", "tools/", ".github/")) or t in ROOT_MD


def exists(root: str, target: str) -> bool:
    """Exacto; y si el token va sin extensión (p. ej. `docs/adr/ADR-012`),
    se resuelve por el archivo que empieza con ese nombre."""
    if os.path.exists(os.path.join(root, target)):
        return True
    if "." not in os.path.basename(target):
        base = os.path.join(root, target)
        parent = os.path.dirname(base) or "."
        prefix = os.path.basename(base)
        if os.path.isdir(parent):
            for entry in os.listdir(parent):
                if entry.startswith(prefix):
                    return True
    return False


def main() -> int:
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    checked = 0
    findings = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            d for d in dirnames if d not in {".git", "node_modules", "venv", ".venv"}
        ]
        for name in filenames:
            if not name.endswith(".md"):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, root)
            with open(path, encoding="utf-8") as fh:
                text = fh.read()
            for line_no, line in enumerate(text.splitlines(), 1):
                for token in TOKEN.findall(line):
                    if not candidate(token):
                        continue
                    target = token.strip()
                    if target.startswith("./"):
                        target = target[2:]
                    if target in IGNORAR:
                        continue
                    checked += 1
                    if not exists(root, target):
                        findings.append((rel, line_no, target))

    print(f"-- check_paths: {checked} rutas comprobadas")
    for rel, line_no, target in findings:
        print(f"  FALTA {target}  ({rel}:{line_no})")
    print(f"-- check_paths: {len(findings)} hallazgos")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
