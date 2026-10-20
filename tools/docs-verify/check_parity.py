#!/usr/bin/env python3
"""Validador de paridad EN <-> ES del paquete documental. Solo lee."""
import re, sys
from pathlib import Path

REPO = Path(sys.argv[1] if len(sys.argv) > 1 else ".")

PAIRS = []
for sub in ("architecture", "adr", "development"):
    for en in sorted((REPO / "docs" / sub).glob("*.md")):
        es = REPO / "docs" / "es" / sub / en.name
        PAIRS.append((en, es))
PAIRS.append((REPO / "DOCUMENT-MANIFEST.md", REPO / "docs" / "es" / "DOCUMENT-MANIFEST.md"))
PAIRS.append((REPO / "README.md", REPO / "docs" / "es" / "README.md"))

def sections(txt):
    out = {}
    for m in re.finditer(r"^(#{2,4})\s+(\d+(?:\.\d+)*)\.?\s*(.*)$", txt, re.M):
        out[m.group(2)] = m.group(3).strip()
    return out

def xrefs(txt):
    """referencias cruzadas del estilo `05` §10.1 / `05` §10.1"""
    return set(re.findall(r"`(\d\d)`\s*§\s*(\d+(?:\.\d+)*)", txt))

def marks(txt):
    return {
        "mermaid": len(re.findall(r"```mermaid", txt)),
        "fences": len(re.findall(r"^```", txt, re.M)),
        "tables": sum(1 for l in txt.splitlines() if l.strip().startswith("|") and set(l.strip()) - set("|-: ")),
        "items": sum(1 for l in txt.splitlines() if re.match(r"^\s*[-*]\s+\S", l)),
        "refs_bold": len(re.findall(r"\*\*(?:Added|Agregado)\s+\d{4}-\d{2}-\d{2}", txt)),
        "applied_tags": len(re.findall(r"(?i)(P-\d\d|K-[LT]?\d+|C-\d)", txt)),
    }

bad = 0
print(f"{'archivo':56} {'secciones':10} {'mermaid':8} {'tablas':8} {'items':8} {'marcas':7} {'xrefs':7}")
for en, es in PAIRS:
    if not es.exists():
        print(f"FALTA ESPEJO: {es.relative_to(REPO)}")
        bad += 1
        continue
    te, ts = en.read_text(encoding="utf-8", errors="replace"), es.read_text(encoding="utf-8", errors="replace")
    se, ss = sections(te), sections(ts)
    me, ms = marks(te), marks(ts)
    xe, xs = xrefs(te), xrefs(ts)
    only_en = sorted(set(se) - set(ss))
    only_es = sorted(set(ss) - set(se))
    refs_only_en = sorted(xe - xs)
    flags = []
    if only_en: flags.append(f"sec solo EN {only_en}")
    if only_es: flags.append(f"sec solo ES {only_es}")
    if me["mermaid"] != ms["mermaid"]: flags.append(f"mermaid {me['mermaid']}!={ms['mermaid']}")
    if abs(me["tables"] - ms["tables"]) > max(2, 0.3 * me["tables"]): flags.append(f"tablas {me['tables']} vs {ms['tables']}")
    if refs_only_en: flags.append(f"xref solo EN {refs_only_en}")
    if me["refs_bold"] != ms["refs_bold"]: flags.append(f"marcas {me['refs_bold']} vs {ms['refs_bold']}")
    if flags:
        bad += 1
        print(f"\n## {en.relative_to(REPO)}")
        for f in flags:
            print(f"   - {f}")
    else:
        print(f"{str(en.relative_to(REPO)):56} OK  ({len(se)} sec, {me['mermaid']} mermaid)")

print(f"\n=== archivos con divergencia: {bad} / {len(PAIRS)}")
