#!/usr/bin/env python3
"""Punto de entrada de la verificación documental. Solo lee.

Corre los cuatro validadores y devuelve un código de salida distinto de cero
si alguno encuentra hallazgos, para que la integración continua falle ante
errores demostrables.

QUÉ COMPRUEBA (determinista)
  1. Enlaces y referencias locales                         check_docs.py
  2. Existencia de las rutas documentadas                   check_paths.py
  3. Inventarios, manifiestos, estados de ADR y refs cruzadas   verify_all.py
  4. Paridad estructural EN <-> ES                          check_parity.py

QUÉ NO COMPRUEBA
  - Consistencia semántica: que el texto diga lo mismo que la decisión.
  - Validez técnica de las tecnologías, licencias o sustituciones.
  - Aprobaciones legales.
Un resultado limpio es una condición necesaria, nunca suficiente.

Uso: python3 tools/docs-verify/verify_docs.py [repo]
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEPS = [
    ("enlaces y referencias locales", "check_docs.py"),
    ("existencia de rutas documentadas", "check_paths.py"),
    ("inventarios, ADR y referencias cruzadas", "verify_all.py"),
    ("paridad estructural EN <-> ES", "check_parity.py"),
]


def main() -> int:
    repo = sys.argv[1] if len(sys.argv) > 1 else "."
    failed = []
    for label, script in STEPS:
        print(f"\n=== {label} ({script})")
        result = subprocess.run(
            [sys.executable, str(HERE / script), repo],
            text=True,
            capture_output=True,
        )
        sys.stdout.write(result.stdout)
        if result.stderr.strip():
            sys.stderr.write(result.stderr)
        if result.returncode != 0:
            failed.append(label)

    print("\n=== resumen")
    if failed:
        for label in failed:
            print(f"  FALLA: {label}")
        print("La verificación documental NO pasó. Corregir antes de publicar.")
        return 1
    print("Los cuatro validadores terminaron sin hallazgos.")
    print("Recordatorio: esto es estructura, no semántica ni validación técnica.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
