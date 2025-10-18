#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-8001}
OUT_DIR_ARG=${2:-}

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

VENV_PY="$PROJECT_ROOT/venv/bin/python"
if [[ ! -f "$VENV_PY" ]]; then
  VENV_PY="$PROJECT_ROOT/venv/bin/python3"
fi
if [[ ! -f "$VENV_PY" ]]; then
  VENV_PY="python3"
fi

SPARK_TMP="/tmp/spark_tmp"
mkdir -p "$SPARK_TMP"

get_default_out_dir() {
  local artifacts="$PROJECT_ROOT/artifacts"
  if [[ ! -d "$artifacts" ]]; then
    echo "artifacts/postpaid_baseline"
    return
  fi
  local latest
  latest=$(ls -1dt "$artifacts"/postpaid_prod_* 2>/dev/null | head -n 1 || true)
  if [[ -n "${latest:-}" ]]; then
    echo "$latest"
  else
    echo "$artifacts/postpaid_baseline"
  fi
}

if [[ -z "${OUT_DIR_ARG:-}" ]]; then
  OUT_DIR="$(get_default_out_dir)"
else
  OUT_DIR="$OUT_DIR_ARG"
fi

export PYSPARK_PYTHON="$VENV_PY"
export PYSPARK_DRIVER_PYTHON="$VENV_PY"
export PYTHONPATH="$PROJECT_ROOT"
export SPARK_LOCAL_DIRS="$SPARK_TMP"
export SPARK_DRIVER_MEM="${SPARK_DRIVER_MEM:-6g}"
export SPARK_EXECUTOR_MEM="${SPARK_EXECUTOR_MEM:-6g}"
export SPARK_SHUFFLE_PARTITIONS="${SPARK_SHUFFLE_PARTITIONS:-24}"
export OUT_DIR="$OUT_DIR"

exec "$VENV_PY" -m uvicorn svc.app:app --host 127.0.0.1 --port "$PORT"


