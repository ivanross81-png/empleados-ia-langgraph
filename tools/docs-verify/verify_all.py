#!/usr/bin/env python3
"""Verificación integral no destructiva del paquete documental.

Comprueba, en orden: inventario, metadatos, estados de ADR (EN=ES), referencias
cruzadas `NN` §X hacia secciones que existen, wikilinks hacia archivos que existen,
balance de bloques de código/Mermaid y paridad de los contadores declarados.
No modifica nada.  Uso: python3 verify-all.py [ruta-del-repo]
"""
import re, sys
from collections import Counter
from pathlib import Path

REPO = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
findings = []

def md_files():
    generated = {".git", "node_modules", "dist", "coverage"}
    return sorted(p for p in REPO.rglob("*.md") if not generated.intersection(p.parts))

# 1. INVENTARIO
files = md_files()
cats = Counter()
for p in files:
    rel = p.relative_to(REPO).as_posix()
    for k in ("docs/es/architecture", "docs/es/adr", "docs/es/development", "docs/es",
              "docs/architecture", "docs/adr", "docs/development", "docs/reference"):
        if rel.startswith(k + "/"):
            cats[k] += 1
            break
    else:
        cats["raíz"] += 1
print("=== 1. INVENTARIO")
print(f"  archivos .md totales: {len(files)}")
for k in ("raíz", "docs/architecture", "docs/adr", "docs/development", "docs/reference",
          "docs/es/architecture", "docs/es/adr", "docs/es/development", "docs/es"):
    print(f"    {k:24} {cats[k]}")
espejos = cats["docs/es/architecture"] + cats["docs/es/adr"] + cats["docs/es/development"]
ESPEJOS_ESPERADOS = 30  # 11 arquitectura + 14 ADR + 5 guías, espejos en docs/es/
print(f"  espejos normativos en español: {espejos} (esperado {ESPEJOS_ESPERADOS})")
if espejos != ESPEJOS_ESPERADOS:
    findings.append(f"espejos español = {espejos}, esperado {ESPEJOS_ESPERADOS}")

# 2. METADATOS
print("\n=== 2. METADATOS DE TRAZABILIDAD")
missing = []
for rel, keys in (("docs/architecture", ["Created", "Updated"]),
                  ("docs/development", ["Created", "Updated"]),
                  ("docs/es/architecture", ["Creado", "Actualizado"]),
                  ("docs/es/development", ["Creado", "Actualizado"])):
    for p in sorted((REPO / rel).glob("*.md")):
        txt = p.read_text(encoding="utf-8")
        for k in keys:
            if f"**{k}:**" not in txt:
                missing.append(f"{p.relative_to(REPO)} sin {k}")
for rel, keys in (("docs/adr", ["Date"]), ("docs/es/adr", ["Fecha"])):
    for p in sorted((REPO / rel).glob("*.md")):
        txt = p.read_text(encoding="utf-8")
        for k in keys:
            if f"**{k}:**" not in txt:
                missing.append(f"{p.relative_to(REPO)} sin {k}")
print(f"  campos faltantes: {len(missing)}")
for m in missing:
    print("   -", m)
findings.extend(missing)

# 3. ESTADOS DE ADR (paridad EN/ES)
print("\n=== 3. ESTADOS DE ADR")
en_states, es_states = {}, {}
for p in sorted((REPO / "docs/adr").glob("*.md")):
    m = re.search(r"^\*\*Status:\*\*\s*(.+)$", p.read_text(encoding="utf-8"), re.M)
    en_states[p.name] = m.group(1).strip() if m else "?"
for p in sorted((REPO / "docs/es/adr").glob("*.md")):
    m = re.search(r"^\*\*Estado:\*\*\s*(.+)$", p.read_text(encoding="utf-8"), re.M)
    es_states[p.name] = m.group(1).strip() if m else "?"
for n in sorted(en_states):
    en, es = en_states.get(n, "-"), es_states.get(n, "-")
    en_kind = "Accepted" if en.startswith("Accepted") else ("Proposed" if "Proposed" in en else en)
    es_kind = "Accepted" if es.startswith("Aceptado") else ("Proposed" if "Propuesto" in es else es)
    ok = (en_kind == "Accepted" and es_kind == "Accepted") or (en_kind == "Proposed" and es_kind == "Proposed")
    print(f"  {n:44} EN={en_kind:9} ES={es_kind:9} {'OK' if ok else 'DIVERGE'}")
    if not ok:
        findings.append(f"estado de ADR divergente en {n}: {en_kind} vs {es_kind}")

# 4. REFERENCIAS CRUZADAS `NN` §X
print("\n=== 4. REFERENCIAS CRUZADAS A SECCIONES")
norm = {}
for i, p in enumerate(sorted((REPO / "docs/architecture").glob("*.md"))):
    num = p.name.split("-")[0]
    secs = set(re.findall(r"^#{2,4}\s+(\d+(?:\.\d+)*)", p.read_text(encoding="utf-8"), re.M))
    norm[num] = (p.name, secs)
JUSTIF = re.compile(r"(?i)(heredad|supersed|anexo|legacy|hist[oó]ric|no existe en los documentos|punteros hist)")
bad = []
for p in md_files():
    txt = p.read_text(encoding="utf-8")
    lines = txt.splitlines()
    for i, line in enumerate(lines):
        for num, sec in re.findall(r"`(\d\d)`\s*§\s*(\d+(?:\.\d+)*)", line):
            # una referencia heredada se acepta si la línea o su contexto la justifican
            ctx = " ".join(lines[max(0, i - 2):i + 3])
            if num in norm and sec not in norm[num][1]:
                if JUSTIF.search(line) or JUSTIF.search(ctx):
                    continue
                bad.append(f"{p.relative_to(REPO)}:{i+1}: `{num}` §{sec} no existe en {norm[num][0]} (sin justificación)")
            elif num not in norm:
                bad.append(f"{p.relative_to(REPO)}:{i+1}: `{num}` no es un documento del paquete")
print(f"  referencias roídas: {len(bad)}")
for b in sorted(set(bad)):
    print("   -", b)
findings.extend(sorted(set(bad)))

# 5. WIKILINKS Y ENLACES RELATIVOS
print("\n=== 5. ENLACES")
names = {p.stem for p in md_files()}
broken = []
for p in md_files():
    txt = p.read_text(encoding="utf-8")
    for w in re.findall(r"\[\[([^\]|#]+)", txt):
        if w.strip() not in names:
            broken.append(f"{p.relative_to(REPO)}: wikilink [[{w}]] sin archivo")
    for t in re.findall(r"\]\(([^)#\s]+\.md)(?:#[^)]*)?\)", txt):
        target = (p.parent / t).resolve()
        if not target.exists() and not (REPO / t).exists():
            broken.append(f"{p.relative_to(REPO)}: enlace {t} sin archivo")
print(f"  enlaces roídos: {len(broken)}")
for b in broken:
    print("   -", b)
findings.extend(broken)

# 6. BLOQUES DE CÓDIGO / MERMAID
print("\n=== 6. BLOQUES Mermaid")
badfence, mermaid = [], 0
for p in md_files():
    lines = p.read_text(encoding="utf-8").splitlines()
    f = sum(1 for l in lines if l.startswith("```"))
    mermaid += sum(1 for l in lines if l.startswith("```mermaid"))
    if f % 2:
        badfence.append(str(p.relative_to(REPO)))
print(f"  bloques mermaid: {mermaid} | cercas impares: {len(badfence)}")
for b in badfence:
    print("   -", b)
findings.extend(badfence)

# 7. CONTADORES DECLARADOS
print("\n=== 7. CONTADORES DECLARADOS")
man = (REPO / "DOCUMENT-MANIFEST.md").read_text(encoding="utf-8")
decl = re.search(r"\*\*Total `?\.?md`? files\*\* \| \*\*(\d+)\*\*", man)
real = len(files)
print(f"  manifiesto declara: {decl.group(1) if decl else '?'} | real: {real}")
if decl and int(decl.group(1)) != real:
    findings.append(f"manifiesto declara {decl.group(1)} .md, reales {real}")
idx = (REPO / "00-INDEX.md").read_text(encoding="utf-8")
if "26 archivos" in idx or "26 documentos" in idx:
    findings.append("00-INDEX.md todavía menciona 26 archivos/documentos")

print("\n=== RESUMEN")
print(f"  hallazgos: {len(findings)}")
for f in findings:
    print("   -", f)
sys.exit(1 if findings else 0)
