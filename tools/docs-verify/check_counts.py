#!/usr/bin/env python3
"""Comprueba que las cantidades DECLARADAS en los manifiestos coincidan con el
inventario real del repositorio — en prosa y en tablas, no solo en la fila
"Total" de la tabla de inventario.

POR QUÉ EXISTE
    Los validadores previos solo miraban la fila del total de `.md` y el
    "26 archivos" del índice. Un recuento obsoleto puede sobrevivir en la frase
    explicativa del conjunto documental ("el paquete contiene 27 archivos: 11
    documentos de arquitectura, 11 ADR y 5 guías de desarrollo") sin que ninguna
    tabla lo delate, porque las tablas se actualizan y la prosa no.

QUÉ COMPRUEBA (determinista)
    1. Frase de composición, en inglés y en español: total, documentos de
       arquitectura, ADR y guías de desarrollo; y que el total sea la suma.
    2. Fila de la tabla de inventario con los tres conteos por categoría.
    3. Cualquier otra declaración de cantidad en la parte de inventario del
       manifiesto (`N ADR`, `N documentos de arquitectura`), en prosa o en tabla.

QUÉ NO COMPRUEBA
    Consistencia semántica, validez técnica, licencias ni aprobaciones legales.

QUÉ NO ROMPE (a propósito)
    Las menciones HISTÓRICAS fechadas del registro de revisiones (sección 8):
    "26 archivos" en la línea base de 2026-09-21 y "27 archivos" en la auditoría
    del 2026-10-19 son hitos de la cronología, no inventario actual. El barrido
    se detiene donde empieza el registro de revisiones, y las líneas de lista con
    fecha nunca se consideran declaraciones de inventario.

Uso: python3 tools/docs-verify/check_counts.py [repo]
Salida distinta de cero si hay hallazgos.
"""
import re
import sys
from pathlib import Path

REPO = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

# Los manifiestos son los documentos que declaran el inventario del paquete.
MANIFIESTOS = ("DOCUMENT-MANIFEST.md", "docs/es/DOCUMENT-MANIFEST.md")
# Donde empieza el registro de revisiones (menciones históricas legítimas).
FIN_INVENTARIO = re.compile(r"^##\s*8[.)]?\s", re.M)
# Línea de lista con fecha = hito histórico ("- **2026-10-19** — …").
HITO_HISTORICO = re.compile(r"^\s*[-*]\s*\*\*?\d{4}-\d{2}-\d{2}")

FORMA_COMPOSICION = [
    ("EN", re.compile(
        r"(?:contains|has|includes|totals?)\s+(\d+)\s+(?:normative\s+)?files?\s*:\s*"
        r"(\d+)\s+(?:architecture|normative)\s+documents?\s*,\s*(\d+)\s+ADRs?\s+and\s+"
        r"(\d+)\s+(?:development|dev)\s+guides?", re.I)),
    ("ES", re.compile(
        r"(?:contiene|tiene|incluye|totaliza)\s+(\d+)\s+(?:archivos?|documentos?)"
        r"(?:\s+normativos?)?\s*:\s*(\d+)\s+documentos? de arquitectura\s*,\s*"
        r"(\d+)\s+ADR\s+y\s+(\d+)\s+guías? de desarrollo", re.I)),
]
FILA_TABLA = re.compile(
    r"`docs/architecture`\s*\((\d+)\)\s*,\s*`docs/adr`\s*\((\d+)\)\s*,\s*"
    r"`docs/development`\s*\((\d+)\)\s*\|\s*(\d+)")
CANTIDAD_ADR = re.compile(r"(\d+)\s+ADRs?\b")
CANTIDAD_ARQ = re.compile(r"(\d+)\s+(?:architecture documents?|documentos de arquitectura)")


def reales() -> dict:
    def n(rel):
        return len(list((REPO / rel).glob("*.md")))
    arq, adr, dev = n("docs/architecture"), n("docs/adr"), n("docs/development")
    return {
        "arquitectura": arq,
        "adr": adr,
        "guias": dev,
        "normativo": arq + adr + dev,
        "md": len([p for p in REPO.rglob("*.md") if ".git" not in p.parts]),
    }


def main() -> int:
    r = reales()
    print("=== CANTIDADES DECLARADAS (prosa y tablas)")
    print(f"  inventario real: arquitectura={r['arquitectura']} ADR={r['adr']} "
          f"guías={r['guias']} normativos={r['normativo']} .md={r['md']}")
    findings = []
    for rel in MANIFIESTOS:
        p = REPO / rel
        if not p.exists():
            findings.append(f"{rel}: no existe")
            continue
        txt = p.read_text(encoding="utf-8")
        m = FIN_INVENTARIO.search(txt)
        inventario = txt[:m.start()] if m else txt
        lineas = inventario.splitlines()

        for etiqueta, patron in FORMA_COMPOSICION:
            for i, linea in enumerate(lineas):
                if HITO_HISTORICO.match(linea):
                    continue
                for total, arq, adr, guias in patron.findall(linea):
                    total, arq, adr, guias = map(int, (total, arq, adr, guias))
                    if (arq, adr, guias) != (r["arquitectura"], r["adr"], r["guias"]):
                        findings.append(
                            f"{rel}:{i+1}: frase de composición ({etiqueta}) declara "
                            f"{arq}/{adr}/{guias} (arquitectura/ADR/guías), real "
                            f"{r['arquitectura']}/{r['adr']}/{r['guias']}")
                    if total != r["normativo"]:
                        findings.append(
                            f"{rel}:{i+1}: frase de composición ({etiqueta}) declara "
                            f"{total} archivos normativos, real {r['normativo']}")
                    if total != arq + adr + guias:
                        findings.append(
                            f"{rel}:{i+1}: el total declarado ({total}) no es la suma "
                            f"de las categorías ({arq + adr + guias})")

        for i, linea in enumerate(lineas):
            if HITO_HISTORICO.match(linea):
                continue
            for arq, adr, guias, total in FILA_TABLA.findall(linea):
                arq, adr, guias, total = map(int, (arq, adr, guias, total))
                if (arq, adr, guias) != (r["arquitectura"], r["adr"], r["guias"]):
                    findings.append(
                        f"{rel}:{i+1}: fila de tabla declara {arq}/{adr}/{guias}, real "
                        f"{r['arquitectura']}/{r['adr']}/{r['guias']}")
                if total != r["normativo"]:
                    findings.append(
                        f"{rel}:{i+1}: fila de tabla declara total {total}, real {r['normativo']}")

        # Declaraciones sueltas de cantidad en la parte de inventario.
        for i, linea in enumerate(lineas):
            if HITO_HISTORICO.match(linea):
                continue
            for valor in CANTIDAD_ADR.findall(linea):
                if int(valor) != r["adr"]:
                    findings.append(
                        f"{rel}:{i+1}: declara {valor} ADR, real {r['adr']} "
                        f"(¿recuento obsoleto?)")
            for valor in CANTIDAD_ARQ.findall(linea):
                if int(valor) != r["arquitectura"]:
                    findings.append(
                        f"{rel}:{i+1}: declara {valor} documentos de arquitectura, "
                        f"real {r['arquitectura']} (¿recuento obsoleto?)")

    print(f"  archivos examinados: {', '.join(MANIFIESTOS)}")
    print(f"  hallazgos: {len(findings)}")
    for f in findings:
        print("   -", f)
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
