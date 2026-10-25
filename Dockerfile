FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/nextjs
COPY nextjs/package.json nextjs/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY nextjs/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM python:3.12-slim AS runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    PYTHON_BACKEND_URL=http://127.0.0.1:8000 \
    PLANT_READINESS_DB_PATH=/var/data/plant_readiness.db
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      libgl1 libglib2.0-0 libgomp1 bash \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . ./
COPY --from=frontend-build /app/nextjs/.next ./nextjs/.next
COPY --from=frontend-build /app/nextjs/node_modules ./nextjs/node_modules
COPY --from=frontend-build /app/nextjs/package.json ./nextjs/package.json
COPY --from=frontend-build /app/nextjs/public ./nextjs/public
EXPOSE 10000
CMD ["bash", "/app/start-container.sh"]
