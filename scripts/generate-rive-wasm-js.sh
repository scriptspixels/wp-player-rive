#!/bin/bash
# Regenerate assets/lib/rive-wasm.js from assets/lib/rive.wasm (dev-only source file).

set -euo pipefail

PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
WASM="$PLUGIN_DIR/assets/lib/rive.wasm"
OUT="$PLUGIN_DIR/assets/lib/rive-wasm.js"

if [ ! -f "$WASM" ]; then
    echo "Error: $WASM not found. Download @rive-app/webgl2 rive.wasm first."
    exit 1
fi

python3 - <<PY
import base64, pathlib
wasm = pathlib.Path("$WASM")
out = pathlib.Path("$OUT")
b64 = base64.b64encode(wasm.read_bytes()).decode("ascii")
out.write_text(
    "/**\n * Embedded @rive-app/webgl2 WASM (generated from rive.wasm).\n */\n"
    "(function(){'use strict';window.motionPlayerRiveWasmBinary='"
    + b64
    + "';})();\n",
    encoding="utf-8",
)
print(f"Generated {out} ({out.stat().st_size} bytes)")
PY
