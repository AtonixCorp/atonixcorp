{{/*
Expand the name of the chart.
*/}}
{{- define "atonixcorp-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "atonixcorp-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "atonixcorp-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "atonixcorp-platform.labels" -}}
helm.sh/chart: {{ include "atonixcorp-platform.chart" . }}
{{ include "atonixcorp-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "atonixcorp-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atonixcorp-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "atonixcorp-platform.backend.labels" -}}
{{ include "atonixcorp-platform.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "atonixcorp-platform.frontend.labels" -}}
{{ include "atonixcorp-platform.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Celery Worker labels
*/}}
{{- define "atonixcorp-platform.celery-worker.labels" -}}
{{ include "atonixcorp-platform.labels" . }}
app.kubernetes.io/component: celery-worker
{{- end }}

{{/*
Celery Beat labels
*/}}
{{- define "atonixcorp-platform.celery-beat.labels" -}}
{{ include "atonixcorp-platform.labels" . }}
app.kubernetes.io/component: celery-beat
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "atonixcorp-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "atonixcorp-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create backend image name
*/}}
{{- define "atonixcorp-platform.backend.image" -}}
{{- $registry := .Values.backend.image.registry -}}
{{- $repository := .Values.backend.image.repository -}}
{{- $tag := .Values.backend.image.tag | default .Chart.AppVersion -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end }}

{{/*
Create frontend image name
*/}}
{{- define "atonixcorp-platform.frontend.image" -}}
{{- $registry := .Values.frontend.image.registry -}}
{{- $repository := .Values.frontend.image.repository -}}
{{- $tag := .Values.frontend.image.tag | default .Chart.AppVersion -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end }}

{{/*
Database URL
*/}}
{{- define "atonixcorp-platform.databaseUrl" -}}
{{- if .Values.postgresql.enabled -}}
postgresql://{{ .Values.postgresql.auth.username }}:{{ .Values.postgresql.auth.password }}@{{ include "atonixcorp-platform.fullname" . }}-postgresql:5432/{{ .Values.postgresql.auth.database }}
{{- else -}}
{{ .Values.backend.env.DATABASE_URL }}
{{- end -}}
{{- end }}

{{/*
Redis URL
*/}}
{{- define "atonixcorp-platform.redisUrl" -}}
{{- if .Values.redis.enabled -}}
{{- if .Values.redis.auth.enabled -}}
redis://:{{ .Values.redis.auth.password }}@{{ include "atonixcorp-platform.fullname" . }}-redis-master:6379/0
{{- else -}}
redis://{{ include "atonixcorp-platform.fullname" . }}-redis-master:6379/0
{{- end -}}
{{- else -}}
{{ .Values.backend.env.REDIS_URL }}
{{- end -}}
{{- end }}