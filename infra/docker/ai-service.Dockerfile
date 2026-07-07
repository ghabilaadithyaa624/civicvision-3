#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f infra/docker/ai-service.Dockerfile -t civicvision-ai-service .

FROM python:3.12-slim AS base

# libgomp1 is required by opencv-python-headless / torch at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps

ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu

COPY apps/ai-service/requirements.txt .

# Use PyPI as the primary registry for general dependencies and keep the
# PyTorch CPU index as a supplemental source for torch/torchvision. That
# keeps the build on CPU-only wheels without making a specialized index
# the main source for unrelated packages.
RUN pip install --no-cache-dir \
    --retries 10 \
    --timeout 120 \
    --index-url ${PIP_INDEX_URL} \
    --extra-index-url ${PIP_EXTRA_INDEX_URL} \
    -r requirements.txt

# ---------- Production ----------
FROM base AS production

RUN addgroup --system civicvision && adduser --system --ingroup civicvision civicvision

COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

COPY apps/ai-service/app ./app
COPY apps/ai-service/main.py .

RUN chown -R civicvision:civicvision /app
USER civicvision

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
