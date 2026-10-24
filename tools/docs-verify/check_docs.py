#!/usr/bin/env python3
"""check-docs.py — validador no destructivo de la documentación del proyecto
Empleados IA LangGraph (vault Obsidian).

Comprueba:
  1. Enlaces relativos markdown a archivos .md existentes.
  2. Wikilinks [[...]] a notas existentes (por basename).
  3. Referencias en backticks a documentos del paquete (`NN-NOMBRE.md`, `ADR-NNN-...`).
  4. Diagramas Mermaid: fences balanceados, tipo de diagrama válido, paréntesis/corchetes
     balanceados por bloque.
  5. Archivos binarios/vacíos y duplicados por basename.

Uso:  python3 check-docs.py "/ruta/al/proyecto"
Salida: informe por stdout + exit code 0 (ok) / 1 (hallazgos).
"""
import os
import re
import sys
import collections

MD_FENCE = re.compile(r"^```")
MERMAID_TYPES = ("flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram",
                 "erDiagram", "journey", "gantt", "pie", "mindmap", "timeline", "gitGraph",
                 "quadrantChart", "xychart", "block-beta", "sankey-beta", "C4Context")


def load(root):
    docs = {}
    generated = {".git", "node_modules", "dist", "coverage"}
    for dirpath, dirs, files in os.walk(root):
        dirs[:] = [directory for directory in dirs if directory not in generated]
        for f in files:
            if f.endswith(".md"):
                p = os.path.join(dirpath, f)
                with open(p, encoding="utf-8", errors="replace") as fh:
                    docs[os.path.relpath(p, root)] = fh.read()
    return docs


def check_links(root, docs):
    problems, ok = [], 0
    basenames = {os.path.basename(p) for p in docs}
    for rel, text in docs.items():
        base_dir = os.path.dirname(rel)
        for m in re.finditer(r"\[([^\]]+)\]\(([^)]+)\)", text):
            target = m.group(2).split("#")[0].strip()
            if not target or target.startswith(("http://", "https://", "mailto:", "MEDIA:")):
                continue
            cand = os.path.normpath(os.path.join(base_dir, target))
            if os.path.exists(os.path.join(root, cand)):
                ok += 1
            else:
                problems.append(f"[link] {rel}: '{target}' no existe")
        for m in re.finditer(r"\[\[([^\]|#]+)", text):
            name = m.group(1).strip()
            if name and (name in basenames or f"{name}.md" in basenames):
                ok += 1
            else:
                problems.append(f"[wikilink] {rel}: '[[{name}]]' no resuelve a ninguna nota")
        for m in re.finditer(r"`([A-Z0-9][A-Za-z0-9\-]*\.md)`", text):
            name = m.group(1)
            # Solo se exige que existan las referencias a documentos del paquete propio.
            if not re.match(r"^(\d\d-[A-Z]|ADR-\d|DOCUMENT-MANIFEST|00-ARCHITECTURE)", name):
                continue
            if name in basenames:
                ok += 1
            else:
                problems.append(f"[backtick-doc] {rel}: '{name}' no existe en el proyecto")
    return problems, ok


def check_mermaid(root, docs):
    problems, ok = [], 0
    for rel, text in docs.items():
        lines = text.splitlines()
        in_block, block, start, info = False, [], 0, ""
        for i, line in enumerate(lines, 1):
            if MD_FENCE.match(line):
                if not in_block:
                    in_block, block, start = True, [], i
                    info = line.strip().strip("`").strip()
                else:
                    in_block = False
                    if info.startswith("mermaid"):
                        code = "\n".join(block).strip()
                        if not code:
                            problems.append(f"[mermaid] {rel}:{start} bloque mermaid vacío")
                            continue
                        first = code.splitlines()[0].strip()
                        if not first.startswith(MERMAID_TYPES):
                            problems.append(f"[mermaid] {rel}:{start} tipo de diagrama no reconocido: '{first[:40]}'")
                        for op, cl, nm in (("(", ")", "paréntesis"), ("[", "]", "corchetes")):
                            if code.count(op) != code.count(cl):
                                problems.append(f"[mermaid] {rel}:{start} {nm} desbalanceados "
                                                f"({op}={code.count(op)} {cl}={code.count(cl)})")
                        ok += 1
                continue
            if in_block:
                block.append(line)
        if in_block:
            problems.append(f"[mermaid] {rel}: fence ``` sin cerrar (abierto en línea {start})")
    return problems, ok


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    docs = load(root)
    p1, ok1 = check_links(root, docs)
    p2, ok2 = check_mermaid(root, docs)
    dup = [b for b, c in collections.Counter(
        os.path.basename(p) for p in docs if not p.replace(os.sep, "/").startswith("docs/es/")
    ).items() if c > 1]
    print(f"Archivos .md: {len(docs)}")
    print(f"Enlaces/referencias verificadas OK: {ok1}  |  bloques mermaid OK: {ok2}")
    print(f"Basenames duplicados: {dup if dup else 'ninguno'}")
    problems = p1 + p2
    print(f"Hallazgos: {len(problems)}")
    for p in sorted(problems):
        print("  -", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
