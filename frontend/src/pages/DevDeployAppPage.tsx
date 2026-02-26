// Deploy App — Intelligent Application Deployment Wizard
// 11-step guided deployment: source → stack → infra → review → live deploy

import React, { useState, useRef, useEffect } from 'react'
import {
  Box, Typography, Stack, Card, CardContent, Button, Chip,
  TextField, LinearProgress, Tooltip, IconButton, Divider,
  Collapse, CircularProgress, Fade
} from '@mui/material'
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem'

// ─── Icons ────────────────────────────────────────────────────────────────────
import CheckCircleIcon      from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import GitHubIcon            from '@mui/icons-material/GitHub'
import StorageIcon           from '@mui/icons-material/Storage'
import AccountTreeIcon       from '@mui/icons-material/AccountTree'
import ViewInArIcon          from '@mui/icons-material/ViewInAr'
import CloudUploadIcon       from '@mui/icons-material/CloudUpload'
import AutoAwesomeIcon       from '@mui/icons-material/AutoAwesome'
import FolderOpenIcon        from '@mui/icons-material/FolderOpenRounded'
import RocketLaunchIcon      from '@mui/icons-material/RocketLaunch'
import ArrowBackIcon         from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon      from '@mui/icons-material/ArrowForward'
import CodeIcon              from '@mui/icons-material/Code'
import SchemaIcon            from '@mui/icons-material/Schema'
import ExpandMoreIcon        from '@mui/icons-material/ExpandMore'
import ExpandLessIcon        from '@mui/icons-material/ExpandLess'
import ContentCopyIcon       from '@mui/icons-material/ContentCopy'
import CheckIcon             from '@mui/icons-material/Check'
import ErrorOutlineIcon      from '@mui/icons-material/ErrorOutline'
import WarningAmberIcon      from '@mui/icons-material/WarningAmber'
import HubIcon               from '@mui/icons-material/Hub'
import LayersIcon            from '@mui/icons-material/Layers'
import MonitorHeartIcon      from '@mui/icons-material/MonitorHeart'
import KeyIcon               from '@mui/icons-material/Key'
import HistoryIcon           from '@mui/icons-material/History'


// ─── Design tokens ────────────────────────────────────────────────────────────
const t = {
  bg:            dashboardTokens.colors.background,
  surface:       dashboardTokens.colors.surface,
  surfaceSubtle: dashboardTokens.colors.surfaceSubtle,
  border:        dashboardTokens.colors.border,
  textPrimary:   dashboardTokens.colors.textPrimary,
  textSecondary: dashboardTokens.colors.textSecondary,
  brand:         dashboardTokens.colors.brandPrimary,
}
const S = dashboardSemanticColors
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

// ─── Step meta ────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1,  label: 'Deployment Source',     icon: <GitHubIcon     sx={{ fontSize: '.95rem' }} /> },
  { n: 2,  label: 'Application Type',      icon: <LayersIcon     sx={{ fontSize: '.95rem' }} /> },
  { n: 3,  label: 'Frontend Technology',   icon: <CodeIcon       sx={{ fontSize: '.95rem' }} /> },
  { n: 4,  label: 'Backend Technology',    icon: <StorageIcon    sx={{ fontSize: '.95rem' }} /> },
  { n: 5,  label: 'Database',             icon: <StorageIcon    sx={{ fontSize: '.95rem' }} /> },
  { n: 6,  label: 'Deployment Mode',      icon: <ViewInArIcon   sx={{ fontSize: '.95rem' }} /> },
  { n: 7,  label: 'Describe Application', icon: <AutoAwesomeIcon sx={{ fontSize: '.95rem' }} /> },
  { n: 8,  label: 'Project',              icon: <FolderOpenIcon sx={{ fontSize: '.95rem' }} /> },
  { n: 9,  label: 'Git Source',           icon: <GitHubIcon     sx={{ fontSize: '.95rem' }} /> },
  { n: 10, label: 'Review & Plan',        icon: <SchemaIcon     sx={{ fontSize: '.95rem' }} /> },
  { n: 11, label: 'Deploy',              icon: <RocketLaunchIcon sx={{ fontSize: '.95rem' }} /> },
]

// ─── Wizard state ─────────────────────────────────────────────────────────────
interface WizardState {
  source:       string
  appType:      string
  frontend:     string
  backend:      string
  database:     string
  deployMode:   string
  description:  string
  project:      string
  newProject:   string
  gitRepo:      string
  gitBranch:    string
}

const DEFAULT: WizardState = {
  source: '', appType: '', frontend: '', backend: '', database: '',
  deployMode: '', description: '', project: '', newProject: '', gitRepo: '', gitBranch: 'main',
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({
  label, description, icon, selected, onClick, badge, wide,
}: {
  label: string; description?: string; icon: React.ReactNode
  selected: boolean; onClick: () => void; badge?: string; wide?: boolean
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: '12px 14px', borderRadius: '10px', cursor: 'pointer', userSelect: 'none',
        border: `1.5px solid ${selected ? t.brand : t.border}`,
        bgcolor: selected ? `rgba(0,224,255,.07)` : t.surface,
        transition: 'all .15s',
        flex: wide ? '1 1 200px' : '1 1 140px',
        minWidth: wide ? 200 : 140,
        maxWidth: wide ? 280 : 180,
        '&:hover': { borderColor: selected ? t.brand : 'rgba(0,224,255,.45)', bgcolor: selected ? `rgba(0,224,255,.09)` : 'rgba(0,224,255,.03)' },
        position: 'relative',
      }}
    >
      {badge && (
        <Chip label={badge} size="small" sx={{ position:'absolute', top:8, right:8, height:16, fontSize:'.6rem', fontWeight:700, bgcolor:`${S.purple}22`, color:S.purple, '& .MuiChip-label':{ px:.6 } }} />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: description ? .5 : 0, color: selected ? t.brand : t.textSecondary }}>
        {icon}
        <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: selected ? t.textPrimary : t.textSecondary, fontFamily: FONT }}>{label}</Typography>
      </Box>
      {description && (
        <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT, lineHeight: 1.4 }}>{description}</Typography>
      )}
    </Box>
  )
}

// ─── Section heading used in Review panel ─────────────────────────────────────
function PlanSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box onClick={() => setOpen(o => !o)} sx={{ display:'flex', alignItems:'center', gap:1, cursor:'pointer', mb: open ? .75 : 0 }}>
        <Box sx={{ color: t.brand }}>{icon}</Box>
        <Typography sx={{ fontSize: '.75rem', fontWeight: 700, color: t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily: FONT, flex:1 }}>{title}</Typography>
        {open ? <ExpandLessIcon sx={{ fontSize: '.9rem', color: t.textSecondary }} /> : <ExpandMoreIcon sx={{ fontSize: '.9rem', color: t.textSecondary }} />}
      </Box>
      <Collapse in={open}>{children}</Collapse>
    </Box>
  )
}

// ─── Inline code block ────────────────────────────────────────────────────────
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }
  return (
    <Box sx={{ position:'relative', bgcolor:'rgba(0,0,0,.35)', borderRadius:'8px', border:`1px solid ${t.border}`, p:'10px 36px 10px 12px', mt:.5 }}>
      <Typography sx={{ fontFamily:'monospace', fontSize:'.72rem', color: t.textPrimary, whiteSpace:'pre-wrap', wordBreak:'break-all', lineHeight:1.6 }}>{code}</Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton size="small" onClick={copy} sx={{ position:'absolute', top:6, right:6, color: t.textSecondary, '&:hover':{ color: t.brand } }}>
          {copied ? <CheckIcon sx={{ fontSize:'.8rem' }} /> : <ContentCopyIcon sx={{ fontSize:'.8rem' }} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

// ─── Log line ─────────────────────────────────────────────────────────────────
function LogLine({ text, type }: { text: string; type: 'info'|'success'|'warn'|'error' }) {
  const c = type==='success' ? S.success : type==='warn' ? S.warning : type==='error' ? S.danger : t.textSecondary
  const prefix = type==='success' ? '✓ ' : type==='warn' ? '⚠ ' : type==='error' ? '✕ ' : '  '
  return (
    <Typography sx={{ fontFamily:'monospace', fontSize:'.72rem', color: c, lineHeight:1.6 }}>{prefix}{text}</Typography>
  )
}

// ─── Simulated log lines for the Deploy step ─────────────────────────────────
const buildLogScript = (state: WizardState): Array<{ text: string; type: 'info'|'success'|'warn'|'error'; delay: number }> => [
  { text: `[CI/CD] Pipeline created for ${state.project || state.newProject || 'new-app'}`, type:'info',    delay: 300  },
  { text: `[GIT]   Cloning ${state.gitRepo || 'github.com/org/repo'} branch ${state.gitBranch}`, type:'info', delay: 900  },
  { text: `[GIT]   HEAD is at a7e3c9f  – clone complete`,                                       type:'success', delay: 1500 },
  { text: `[ENV]   Injecting environment variables (${state.appType||'app'} profile)`,           type:'info', delay: 2100 },
  { text: `[ENV]   DATABASE_URL, SECRET_KEY, API_PORT  — 3 variables injected`,                 type:'success', delay: 2700 },
  { text: `[BUILD] Detecting build system — ${state.frontend||'React'} + ${state.backend||'Node.js'}`, type:'info', delay: 3200 },
  { text: `[BUILD] Installing dependencies…`,                                                    type:'info', delay: 4000  },
  { text: `[BUILD] Build command: npm run build`,                                                type:'info', delay: 5000  },
  { text: `[BUILD] Build complete — dist/  (2.4 MB)`,                                           type:'success', delay: 6200 },
  { text: `[DOCKER] Building container image…`,                                                  type:'info', delay: 7000  },
  { text: `[DOCKER] Step 1/8 — FROM node:20-alpine`,                                            type:'info', delay: 7500  },
  { text: `[DOCKER] Step 5/8 — COPY dist/ /app/dist/`,                                          type:'info', delay: 8400  },
  { text: `[DOCKER] Step 8/8 — CMD ["node","server.js"]`,                                       type:'info', delay: 9200  },
  { text: `[DOCKER] Image built: registry.atonixcorp.io/${state.project||'app'}:latest`,        type:'success', delay: 10000 },
  { text: `[REGISTRY] Pushing image to AtonixCorp Container Registry…`,                        type:'info', delay: 10800 },
  { text: `[REGISTRY] Push complete`,                                                            type:'success', delay: 12000 },
  { text: `[DB]    Provisioning ${state.database||'PostgreSQL'} instance…`,                    type:'info', delay: 12700 },
  { text: `[DB]    Instance ready — atonix-pg-${Math.floor(Math.random()*900+100)}`,            type:'success', delay: 14000 },
  { text: state.deployMode === 'kubernetes'
      ? `[K8S]   Applying Kubernetes manifests (deployment + service + ingress)…`
      : `[CONTAINER] Deploying container to runtime…`,                                          type:'info', delay: 14800 },
  { text: state.deployMode === 'kubernetes'
      ? `[K8S]   Pods: 2/2 Running — Health checks passing`
      : `[CONTAINER] Container started — health check OK`,                                      type:'success', delay: 16500 },
  { text: `[MONITOR] Monitoring rules activated — alerting on p95 > 800ms`,                    type:'info', delay: 17200 },
  { text: `[AUDIT]  Deployment event recorded in Audit Logs`,                                  type:'info', delay: 17800 },
  { text: `[DONE]  Deployment successful 🚀  — https://${(state.project||'new-app').toLowerCase()}.atonixcorp.app`, type:'success', delay: 18500 },
]

// ─── Existing mock projects ────────────────────────────────────────────────────
const MOCK_PROJECTS = ['payment-platform', 'web-frontend', 'analytics-service', 'media-pipeline']

// ─── Generate deployment plan ─────────────────────────────────────────────────
function buildPlan(state: WizardState) {
  const proj   = state.project || state.newProject || 'new-app'
  const fe     = state.frontend  || 'React'
  const be     = state.backend   || 'Node.js'
  const db     = state.database  || 'PostgreSQL'
  const mode   = state.deployMode === 'kubernetes' ? 'Kubernetes' : 'Container'

  const envVars: string[] = [
    `DATABASE_URL=postgres://atonix:***@atonix-pg.internal:5432/${proj}`,
    `SECRET_KEY=<auto-generated>`,
    `API_PORT=8000`,
  ]
  if (fe === 'Next.js') envVars.push('NEXT_PUBLIC_API_URL=https://api.atonixcorp.app')
  if (be.includes('Django') || be.includes('FastAPI')) envVars.push('DJANGO_SETTINGS_MODULE=config.prod')
  if (db === 'Redis') envVars.push('REDIS_URL=redis://atonix-redis.internal:6379')

  const buildSteps = [
    `git clone ${state.gitRepo || 'github.com/org/repo'} && git checkout ${state.gitBranch}`,
    fe === 'React'   ? 'npm ci && npm run build'
    : fe === 'Next.js' ? 'npm ci && npm run build'
    : fe === 'Vue'   ? 'npm ci && npm run build'
    : 'npm ci && npm run build',
    be.includes('Django') ? 'pip install -r requirements.txt && python manage.py collectstatic --noinput'
    : be.includes('Go')   ? 'go mod download && go build -o app ./cmd'
    : 'npm ci',
    `docker build -t registry.atonixcorp.io/${proj}:latest .`,
    `docker push registry.atonixcorp.io/${proj}:latest`,
  ]

  const deploySteps = mode === 'Kubernetes' ? [
    `kubectl apply -f manifests/namespace.yaml`,
    `kubectl apply -f manifests/secret.yaml`,
    `kubectl apply -f manifests/deployment.yaml`,
    `kubectl apply -f manifests/service.yaml`,
    `kubectl apply -f manifests/ingress.yaml`,
    `kubectl rollout status deployment/${proj}`,
  ] : [
    `docker pull registry.atonixcorp.io/${proj}:latest`,
    `docker stop ${proj} || true`,
    `docker run -d --name ${proj} --env-file .env -p 8000:8000 registry.atonixcorp.io/${proj}:latest`,
  ]

  const dockerfile = `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
EXPOSE 8000
CMD ["node", "server.js"]`

  const k8sDeployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${proj}
  namespace: ${proj}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${proj}
  template:
    spec:
      containers:
      - name: ${proj}
        image: registry.atonixcorp.io/${proj}:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: ${proj}-secrets
        readinessProbe:
          httpGet: { path: /health, port: 8000 }
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests: { cpu: "100m", memory: "128Mi" }
          limits:   { cpu: "500m", memory: "512Mi" }`

  return { proj, fe, be, db, mode, envVars, buildSteps, deploySteps, dockerfile, k8sDeployment }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export interface NewDeploymentPayload {
  appName:     string
  environment: 'dev' | 'stage' | 'prod'
  branch:      string
  image:       string
  hostname:    string
  deployMode:  string
  frontend:    string
  backend:     string
  database:    string
}

const DevDeployAppPage: React.FC<{ onDeployComplete?: (p: NewDeploymentPayload) => void }> = ({ onDeployComplete }) => {
  const [step,    setStep]    = useState(1)
  const [state,   setState]   = useState<WizardState>(DEFAULT)
  const [deploying, setDeploying] = useState(false)
  const [logLines,  setLogLines]  = useState<Array<{ text:string; type:'info'|'success'|'warn'|'error' }>>([])
  const [deployDone, setDeployDone] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const plan = buildPlan(state)

  const set = (key: keyof WizardState, val: string) =>
    setState(prev => ({ ...prev, [key]: val }))

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logLines])

  // AI suggestions after description typed
  useEffect(() => {
    if (step === 7 && state.description.length > 20) {
      setAiThinking(true)
      setAiSuggestions([])
      const t = setTimeout(() => {
        setAiThinking(false)
        const sugg: string[] = []
        const d = state.description.toLowerCase()
        if (d.includes('financial') || d.includes('payment')) {
          sugg.push('Enable PCI-DSS compliance mode')
          sugg.push('Enforce mTLS between services')
          sugg.push('Set up 14-day audit log retention')
        } else if (d.includes('news') || d.includes('media')) {
          sugg.push('Enable CDN edge caching (recommended)')
          sugg.push('Auto-scale on traffic spikes > 1k req/s')
          sugg.push('Add media upload queue (S3-compatible)')
        } else if (d.includes('ai') || d.includes('ml') || d.includes('research')) {
          sugg.push('Provision GPU-enabled worker nodes')
          sugg.push('Configure large memory limits (32Gi)')
          sugg.push('Enable distributed task queue (Celery + Redis)')
        } else {
          sugg.push('Set up horizontal pod autoscaler (min:2 max:10)')
          sugg.push('Enable Prometheus + Grafana monitoring')
          sugg.push('Configure daily database backups')
        }
        setAiSuggestions(sugg)
      }, 1400)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, state.description])

  // Simulate deploy
  const runDeploy = () => {
    setDeploying(true)
    setLogLines([])
    setDeployDone(false)
    const lines = buildLogScript(state)
    lines.forEach(({ text, type, delay }) => {
      setTimeout(() => {
        setLogLines(prev => [...prev, { text, type }])
        if (delay === lines[lines.length - 1].delay) {
          setTimeout(() => {
            setDeployDone(true)
            onDeployComplete?.({
              appName:    plan.proj,
              environment:'prod',
              branch:     state.gitBranch || 'main',
              image:      `registry.atonixcorp.io/${plan.proj}:latest`,
              hostname:   `${plan.proj.toLowerCase()}.atonixcorp.app`,
              deployMode: state.deployMode,
              frontend:   state.frontend,
              backend:    state.backend,
              database:   state.database,
            })
          }, 400)
        }
      }, delay)
    })
  }

  const canNext = (): boolean => {
    if (step === 1)  return Boolean(state.source)
    if (step === 2)  return Boolean(state.appType)
    if (step === 3)  return Boolean(state.frontend)
    if (step === 4)  return Boolean(state.backend)
    if (step === 5)  return Boolean(state.database)
    if (step === 6)  return Boolean(state.deployMode)
    if (step === 7)  return state.description.length >= 10
    if (step === 8)  return Boolean(state.project) || state.newProject.trim().length > 0
    if (step === 9)  return state.gitRepo.trim().length > 0
    if (step === 10) return true
    return false
  }

  const pct = Math.round(((step - 1) / 10) * 100)

  return (
    <Box sx={{ display:'flex', height:'calc(100vh - 64px)', fontFamily:FONT, overflow:'hidden' }}>

      {/* ─── Left sidebar — step list ─── */}
      <Box sx={{
        width: 228, flexShrink:0,
        borderRight:`1px solid ${t.border}`,
        bgcolor: t.surface,
        display:'flex', flexDirection:'column',
        py:2, overflowY:'auto',
      }}>
        {/* Title */}
        <Box sx={{ px:2, mb:2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:.5 }}>
            <RocketLaunchIcon sx={{ fontSize:'1.1rem', color: t.brand }} />
            <Typography sx={{ fontWeight:800, fontSize:'.95rem', color:t.textPrimary, fontFamily:FONT, letterSpacing:'-.01em' }}>
              Deploy App
            </Typography>
          </Stack>
          <Typography sx={{ fontSize:'.7rem', color:t.textSecondary, fontFamily:FONT }}>
            Intelligent deployment wizard
          </Typography>
        </Box>

        {/* Progress bar */}
        <Box sx={{ px:2, mb:2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb:.4 }}>
            <Typography sx={{ fontSize:'.65rem', color:t.textSecondary, fontFamily:FONT }}>Progress</Typography>
            <Typography sx={{ fontSize:'.65rem', color: t.brand, fontWeight:700, fontFamily:FONT }}>{pct}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct}
            sx={{ height:3, borderRadius:2, bgcolor:`${t.brand}22`, '& .MuiLinearProgress-bar':{ bgcolor: t.brand, borderRadius:2 } }} />
        </Box>

        <Divider sx={{ borderColor: t.border, mb:1 }} />

        {/* Steps */}
        {STEPS.map(s => {
          const done    = s.n < step
          const active  = s.n === step
          const pending = s.n > step
          return (
            <Box
              key={s.n}
              onClick={() => { if (done) setStep(s.n) }}
              sx={{
                display:'flex', alignItems:'center', gap:1,
                px:2, py:.7, mx:.5, borderRadius:'7px', cursor: done ? 'pointer' : 'default',
                bgcolor: active ? `rgba(0,224,255,.1)` : 'transparent',
                '&:hover': done ? { bgcolor:'rgba(0,224,255,.06)' } : {},
                mb:.2,
              }}
            >
              {/* Step indicator */}
              <Box sx={{
                width:20, height:20, borderRadius:'50%', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                bgcolor: done ? S.success : active ? t.brand : 'transparent',
                border: `1.5px solid ${done ? S.success : active ? t.brand : t.border}`,
              }}>
                {done
                  ? <CheckIcon sx={{ fontSize:'.65rem', color:'#000' }} />
                  : <Typography sx={{ fontSize:'.6rem', fontWeight:700, color: active ? '#000' : t.textSecondary, lineHeight:1 }}>{s.n}</Typography>
                }
              </Box>
              <Box sx={{ color: done ? S.success : active ? t.brand : t.textSecondary, display:'flex', alignItems:'center', lineHeight:1 }}>
                {React.cloneElement(s.icon as React.ReactElement<any>, { sx:{ fontSize:'.82rem' } })}
              </Box>
              <Typography sx={{
                fontSize:'.76rem', fontFamily:FONT,
                fontWeight: active ? 700 : done ? 600 : 400,
                color: done ? t.textPrimary : active ? t.textPrimary : t.textSecondary,
                flex:1,
              }}>{s.label}</Typography>
              {active && <Box sx={{ width:4, height:4, borderRadius:'50%', bgcolor: t.brand, flexShrink:0 }} />}
            </Box>
          )
        })}

        <Box sx={{ flex:1 }} />
        <Divider sx={{ borderColor: t.border, mt:1 }} />
        <Box sx={{ px:2, pt:1.5, pb:.5 }}>
          <Typography sx={{ fontSize:'.65rem', color:t.textSecondary, fontFamily:FONT, lineHeight:1.5 }}>
            All deployments are integrated with CI/CD, Kubernetes, Monitoring, IAM, and Audit Logs.
          </Typography>
        </Box>
      </Box>

      {/* ─── Center wizard ─── */}
      <Box sx={{ flex:1, overflowY:'auto', px:{ xs:2, md:4 }, py:3 }}>

        {/* ── Step 1: Source ── */}
        {step === 1 && (
          <Fade in><Box>
            <StepHeader step={1} title="Choose Deployment Source" subtitle="Where is your application code hosted?" />
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mt:2 }}>
              {[
                { val:'github',   label:'GitHub',             icon:<GitHubIcon sx={{ fontSize:'1.2rem' }} />,   desc:'Deploy from any GitHub repository' },
                { val:'gitlab',   label:'GitLab',             icon:<CodeIcon   sx={{ fontSize:'1.2rem' }} />,   desc:'Deploy from GitLab, including self-hosted' },
                { val:'bitbucket',label:'Bitbucket',          icon:<HubIcon    sx={{ fontSize:'1.2rem' }} />,   desc:'Deploy from Atlassian Bitbucket' },
                { val:'atonix',   label:'AtonixCorp Project', icon:<RocketLaunchIcon sx={{ fontSize:'1.2rem' }} />, desc:'Import from an existing platform project', badge:'Auto-detect' },
                { val:'zip',      label:'ZIP Upload',         icon:<CloudUploadIcon sx={{ fontSize:'1.2rem' }} />, desc:'Upload a compressed archive' },
              ].map(o => (
                <OptionCard key={o.val} label={o.label} description={o.desc} icon={o.icon} badge={o.badge}
                  selected={state.source === o.val} onClick={() => set('source', o.val)} wide />
              ))}
            </Stack>
            {state.source === 'atonix' && (
              <InfoBanner icon={<AutoAwesomeIcon sx={{ fontSize:'.9rem' }} />} color={t.brand}>
                Auto-detecting languages, Dockerfiles, Kubernetes manifests, environment variables, and build commands from your project.
              </InfoBanner>
            )}
          </Box></Fade>
        )}

        {/* ── Step 2: App type ── */}
        {step === 2 && (
          <Fade in><Box>
            <StepHeader step={2} title="Choose Application Type" subtitle="Helps the platform select the right architecture, scaling, and security defaults." />
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mt:2 }}>
              {[
                { val:'financial',   label:'Financial App',     icon:'💳', desc:'Payments, banking, trading. PCI-DSS aware.' },
                { val:'technology',  label:'Technology App',    icon:'⚙️',  desc:'SaaS, internal tools, APIs.' },
                { val:'ecommerce',   label:'E-Commerce',        icon:'🛍️',  desc:'Storefronts, checkout, inventory.' },
                { val:'news',        label:'News / Media',      icon:'📰', desc:'Publishing, video, real-time updates.' },
                { val:'research',    label:'Research / Science',icon:'🔬', desc:'Data processing, notebooks, pipelines.' },
                { val:'social',      label:'Social App',        icon:'💬', desc:'Feeds, messaging, notifications.' },
                { val:'ai',          label:'AI / ML App',       icon:'🤖', desc:'Model serving, training, inference.' },
                { val:'custom',      label:'Custom',            icon:'✳️',  desc:'I will configure everything manually.' },
              ].map(o => (
                <OptionCard key={o.val} label={o.label} description={o.desc}
                  icon={<Typography sx={{ fontSize:'1.2rem', lineHeight:1 }}>{o.icon}</Typography>}
                  selected={state.appType === o.val} onClick={() => set('appType', o.val)} />
              ))}
            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 3: Frontend ── */}
        {step === 3 && (
          <Fade in><Box>
            <StepHeader step={3} title="Choose Frontend Technology" subtitle="The platform will auto-generate build commands, CI/CD steps, and environment variables." />
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mt:2 }}>
              {[
                { val:'React',       icon:'⚛️',  desc:'CRA / Vite, build → dist/' },
                { val:'Next.js',     icon:'▲',   desc:'SSR + SSG, Node.js runtime' },
                { val:'Vue',         icon:'💚',  desc:'Vite / Nuxt supported' },
                { val:'Angular',     icon:'🔴',  desc:'ng build, standard CLI' },
                { val:'Svelte',      icon:'🟠',  desc:'SvelteKit compatible' },
                { val:'Flutter Web', icon:'🐦',  desc:'flutter build web' },
                { val:'Static HTML', icon:'📄',  desc:'Plain HTML/CSS/JS, no build step' },
                { val:'None',        icon:'—',   desc:'No frontend (API-only)' },
              ].map(o => (
                <OptionCard key={o.val} label={o.val}  description={o.desc}
                  icon={<Typography sx={{ fontSize:'1.1rem', lineHeight:1 }}>{o.icon}</Typography>}
                  selected={state.frontend === o.val} onClick={() => set('frontend', o.val)} />
              ))}
            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 4: Backend ── */}
        {step === 4 && (
          <Fade in><Box>
            <StepHeader step={4} title="Choose Backend Technology" subtitle="Auto-generates Dockerfile, health checks, build commands, and runtime config." />
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mt:2 }}>
              {[
                { val:'Node.js',       icon:'🟢', desc:'Express, Fastify, NestJS' },
                { val:'Python/Django', icon:'🐍', desc:'Full-stack Django framework' },
                { val:'Python/FastAPI',icon:'⚡', desc:'Async Python REST API' },
                { val:'Python/Flask',  icon:'🌶️', desc:'Lightweight WSGI framework' },
                { val:'PHP/Laravel',   icon:'🐘', desc:'Laravel + Composer' },
                { val:'Java/Spring',   icon:'☕', desc:'Spring Boot JAR deploy' },
                { val:'Go',            icon:'🐹', desc:'Compiled Go binary' },
                { val:'Ruby/Rails',    icon:'💎', desc:'Rails + Puma' },
                { val:'.NET',          icon:'🟣', desc:'.NET 8 / ASP.NET Core' },
                { val:'Rust',          icon:'🦀', desc:'Actix / Axum binary' },
                { val:'None',          icon:'—',  desc:'Frontend only / static site' },
              ].map(o => (
                <OptionCard key={o.val} label={o.val} description={o.desc}
                  icon={<Typography sx={{ fontSize:'1.1rem', lineHeight:1 }}>{o.icon}</Typography>}
                  selected={state.backend === o.val} onClick={() => set('backend', o.val)} />
              ))}
            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 5: Database ── */}
        {step === 5 && (
          <Fade in><Box>
            <StepHeader step={5} title="Choose Database" subtitle="The platform will provision, connect, and inject credentials automatically." />
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap sx={{ mt:2 }}>
              {[
                { val:'PostgreSQL', icon:'🐘', desc:'ACID-compliant relational DB. Default choice.' },
                { val:'MySQL',      icon:'🐬', desc:'Wide compatibility, high performance.' },
                { val:'MongoDB',    icon:'🍃', desc:'Flexible document store.' },
                { val:'Redis',      icon:'🔴', desc:'In-memory cache + pub/sub.' },
                { val:'NoSQL',      icon:'📦', desc:'DynamoDB-style key-value store.' },
                { val:'SQLite',     icon:'📁', desc:'Local development only. Not for production.' },
                { val:'None',       icon:'—',  desc:'No database required.' },
              ].map(o => (
                <OptionCard key={o.val} label={o.val} description={o.desc}
                  icon={<Typography sx={{ fontSize:'1.1rem', lineHeight:1 }}>{o.icon}</Typography>}
                  selected={state.database === o.val} onClick={() => set('database', o.val)} wide />
              ))}
            </Stack>
            {state.database === 'SQLite' && (
              <InfoBanner icon={<WarningAmberIcon sx={{ fontSize:'.9rem' }} />} color={S.warning}>
                SQLite is only suitable for local development. It will not be provisioned in production environments.
              </InfoBanner>
            )}
          </Box></Fade>
        )}

        {/* ── Step 6: Deploy Mode ── */}
        {step === 6 && (
          <Fade in><Box>
            <StepHeader step={6} title="Choose Deployment Mode" subtitle="The platform recommends Container for simple apps and Kubernetes for multi-service architectures." />
            <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap sx={{ mt:2 }}>
              <ModeCard
                val="container" label="Container App" icon={<ViewInArIcon sx={{ fontSize:'1.5rem' }} />}
                selected={state.deployMode === 'container'} onClick={() => set('deployMode','container')}
                features={['Build Docker image','Push to Container Registry','Deploy to container runtime','Simple & fast']}
                recommended={state.appType !== 'ai' && state.appType !== 'research'}
                tag="Recommended for most apps"
              />
              <ModeCard
                val="kubernetes" label="Kubernetes App" icon={<HubIcon sx={{ fontSize:'1.5rem' }} />}
                selected={state.deployMode === 'kubernetes'} onClick={() => set('deployMode','kubernetes')}
                features={['Generate K8s manifests','Auto-scaling (HPA)','Ingress + TLS','Secrets management','Rolling deploys + rollback']}
                recommended={state.appType === 'ai' || state.appType === 'financial' || state.appType === 'research'}
                tag="For complex architectures"
              />
            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 7: Description (AI Layer) ── */}
        {step === 7 && (
          <Fade in><Box>
            <StepHeader step={7} title="Describe Your Application"
              subtitle="AtonixCorp Intelligence will read your description and suggest scaling, security, monitoring, and deployment architecture." />
            <TextField
              multiline rows={5} fullWidth value={state.description}
              onChange={e => set('description', e.target.value)}
              placeholder='e.g. "I am building a financial app that handles user accounts, transactions, and analytics across multiple currencies."'
              sx={{ mt:2, '& .MuiOutlinedInput-root':{ fontFamily:FONT, fontSize:'.84rem', bgcolor:t.surface, borderRadius:'10px',
                '& fieldset':{ borderColor: t.border }, '&:hover fieldset':{ borderColor:'rgba(0,224,255,.5)' },
                '&.Mui-focused fieldset':{ borderColor: t.brand } },
                '& textarea':{ color: t.textPrimary } }}
            />
            <Typography sx={{ fontSize:'.68rem', color: t.textSecondary, fontFamily:FONT, mt:.75 }}>
              {state.description.length} characters — minimum 10 required
            </Typography>

            {/* AI thinking */}
            {aiThinking && (
              <Box sx={{ display:'flex', alignItems:'center', gap:1, mt:2, p:'10px 14px', borderRadius:'8px', border:`1px solid rgba(0,224,255,.25)`, bgcolor:'rgba(0,224,255,.05)' }}>
                <CircularProgress size={14} sx={{ color: t.brand }} />
                <Typography sx={{ fontSize:'.78rem', color: t.brand, fontFamily:FONT }}>AtonixCorp Intelligence is analyzing your description…</Typography>
              </Box>
            )}

            {/* AI suggestions */}
            {aiSuggestions.length > 0 && (
              <Box sx={{ mt:1.5, p:'12px 16px', borderRadius:'10px', border:`1px solid rgba(0,224,255,.28)`, bgcolor:'rgba(0,224,255,.05)' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:1 }}>
                  <AutoAwesomeIcon sx={{ fontSize:'.9rem', color: t.brand }} />
                  <Typography sx={{ fontSize:'.75rem', fontWeight:700, color: t.brand, fontFamily:FONT }}>AtonixCorp Intelligence Suggestions</Typography>
                </Stack>
                <Stack spacing={.6}>
                  {aiSuggestions.map((s,i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon sx={{ fontSize:'.8rem', color: S.success }} />
                      <Typography sx={{ fontSize:'.78rem', color: t.textPrimary, fontFamily:FONT }}>{s}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Box></Fade>
        )}

        {/* ── Step 8: Project ── */}
        {step === 8 && (
          <Fade in><Box>
            <StepHeader step={8} title="Choose or Create Project"
              subtitle="Existing projects inherit environment variables, secrets, CI/CD rules, and access controls." />
            <Typography sx={{ fontSize:'.78rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:FONT, mt:2, mb:1 }}>
              Existing Projects
            </Typography>
            <Stack spacing={.75}>
              {MOCK_PROJECTS.map(p => (
                <Box key={p} onClick={() => { set('project', p); set('newProject','') }}
                  sx={{ p:'10px 14px', borderRadius:'8px', border:`1.5px solid ${state.project===p ? t.brand : t.border}`,
                    bgcolor: state.project===p ? 'rgba(0,224,255,.07)' : t.surface, cursor:'pointer', display:'flex', alignItems:'center', gap:1.5,
                    '&:hover':{ borderColor:'rgba(0,224,255,.45)' } }}>
                  <FolderOpenIcon sx={{ fontSize:'.9rem', color: state.project===p ? t.brand : t.textSecondary }} />
                  <Typography sx={{ fontSize:'.83rem', fontWeight:600, color: t.textPrimary, fontFamily:FONT, flex:1 }}>{p}</Typography>
                  {state.project===p && <CheckIcon sx={{ fontSize:'.85rem', color: t.brand }} />}
                </Box>
              ))}
            </Stack>
            <Divider sx={{ borderColor:t.border, my:2 }} />
            <Typography sx={{ fontSize:'.78rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:FONT, mb:1 }}>
              Create New Project
            </Typography>
            <TextField
              fullWidth placeholder="new-project-name"
              value={state.newProject}
              onChange={e => { set('newProject', e.target.value); set('project','') }}
              size="small"
              sx={{ '& .MuiOutlinedInput-root':{ fontFamily:FONT, fontSize:'.83rem', bgcolor:t.surface, borderRadius:'8px',
                '& fieldset':{ borderColor:t.border }, '&:hover fieldset':{ borderColor:'rgba(0,224,255,.5)' },
                '&.Mui-focused fieldset':{ borderColor:t.brand } },
                '& input':{ color:t.textPrimary }
              }}
            />
          </Box></Fade>
        )}

        {/* ── Step 9: Git Source ── */}
        {step === 9 && (
          <Fade in><Box>
            <StepHeader step={9} title="Choose Git Source"
              subtitle="Provide the repository URL. The platform will detect branches, Dockerfiles, manifests, and build commands." />
            <Stack spacing={2} sx={{ mt:2 }}>
              <Box>
                <Typography sx={{ fontSize:'.78rem', fontWeight:600, color:t.textSecondary, fontFamily:FONT, mb:.75 }}>Repository URL</Typography>
                <TextField
                  fullWidth placeholder="https://github.com/org/repo"
                  value={state.gitRepo} onChange={e => set('gitRepo', e.target.value)}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root':{ fontFamily:FONT, fontSize:'.83rem', bgcolor:t.surface, borderRadius:'8px',
                    '& fieldset':{ borderColor:t.border }, '&:hover fieldset':{ borderColor:'rgba(0,224,255,.5)' },
                    '&.Mui-focused fieldset':{ borderColor:t.brand } },
                    '& input':{ color:t.textPrimary }
                  }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize:'.78rem', fontWeight:600, color:t.textSecondary, fontFamily:FONT, mb:.75 }}>Branch</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {['main','master','develop','staging','production'].map(b => (
                    <Chip key={b} label={b} onClick={() => set('gitBranch', b)} size="small"
                      sx={{ fontFamily:FONT, fontSize:'.75rem', fontWeight:600, cursor:'pointer',
                        bgcolor: state.gitBranch===b ? `rgba(0,224,255,.15)` : t.surfaceSubtle,
                        color: state.gitBranch===b ? t.brand : t.textSecondary,
                        border: `1px solid ${state.gitBranch===b ? t.brand : t.border}` }} />
                  ))}
                  <TextField
                    placeholder="custom-branch" size="small"
                    value={['main','master','develop','staging','production'].includes(state.gitBranch) ? '' : state.gitBranch}
                    onChange={e => set('gitBranch', e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root':{ fontFamily:FONT, fontSize:'.75rem', bgcolor:t.surface, borderRadius:'6px', height:28,
                      '& fieldset':{ borderColor:t.border }, '&.Mui-focused fieldset':{ borderColor:t.brand } },
                      '& input':{ color:t.textPrimary, py:.3, px:1 }, width:130 }}
                  />
                </Stack>
              </Box>
              {state.gitRepo.length > 8 && (
                <InfoBanner icon={<AutoAwesomeIcon sx={{ fontSize:'.9rem' }} />} color={t.brand}>
                  Auto-detected: Dockerfile ✓  &nbsp;|&nbsp;  Kubernetes manifests ✓  &nbsp;|&nbsp;  .env.example ✓  &nbsp;|&nbsp;  package.json ✓
                </InfoBanner>
              )}
            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 10: Review & Plan ── */}
        {step === 10 && (
          <Fade in><Box>
            <StepHeader step={10} title="Review & Auto-Generated Deployment Plan"
              subtitle="Review the complete deployment architecture before launching. All configurations are auto-generated." />
            <Stack spacing={1.5} sx={{ mt:2 }}>

              {/* Summary chips */}
              <Box sx={{ display:'flex', flexWrap:'wrap', gap:.75 }}>
                {[
                  { label: `Source: ${state.source || '—'}`,    color: t.brand },
                  { label: `Type: ${state.appType || '—'}`,     color: S.purple },
                  { label: `Frontend: ${state.frontend || '—'}`, color: S.info },
                  { label: `Backend: ${state.backend || '—'}`,  color: S.warning },
                  { label: `DB: ${state.database || '—'}`,      color: S.success },
                  { label: `Mode: ${plan.mode}`,                 color: plan.mode === 'Kubernetes' ? S.purple : S.info },
                  { label: `Branch: ${state.gitBranch}`,         color: t.textSecondary },
                ].map(c => (
                  <Chip key={c.label} label={c.label} size="small"
                    sx={{ bgcolor:`${c.color}18`, color:c.color, fontFamily:FONT, fontSize:'.72rem', fontWeight:700, border:`1px solid ${c.color}44`,
                      '& .MuiChip-label':{ px:.8 } }} />
                ))}
              </Box>

              <PlanSection icon={<LayersIcon sx={{ fontSize:'.95rem' }} />} title="Architecture Diagram">
                <Box sx={{ bgcolor:'rgba(0,0,0,.25)', borderRadius:'8px', border:`1px solid ${t.border}`, p:2, mt:.5 }}>
                  <ArchDiagram state={state} plan={plan} />
                </Box>
              </PlanSection>

              <PlanSection icon={<CodeIcon sx={{ fontSize:'.95rem' }} />} title="Build Steps">
                {plan.buildSteps.map((s,i) => (
                  <CodeBlock key={i} code={`${i+1}. ${s}`} />
                ))}
              </PlanSection>

              <PlanSection icon={<RocketLaunchIcon sx={{ fontSize:'.95rem' }} />} title="Deploy Steps">
                {plan.deploySteps.map((s,i) => (
                  <CodeBlock key={i} code={`${i+1}. ${s}`} />
                ))}
              </PlanSection>

              <PlanSection icon={<KeyIcon sx={{ fontSize:'.95rem' }} />} title="Environment Variables">
                {plan.envVars.map((v,i) => <CodeBlock key={i} code={v} />)}
              </PlanSection>

              <PlanSection icon={<ViewInArIcon sx={{ fontSize:'.95rem' }} />} title="Auto-Generated Dockerfile">
                <CodeBlock code={plan.dockerfile} />
              </PlanSection>

              {state.deployMode === 'kubernetes' && (
                <PlanSection icon={<HubIcon sx={{ fontSize:'.95rem' }} />} title="Kubernetes Deployment Manifest">
                  <CodeBlock code={plan.k8sDeployment} />
                </PlanSection>
              )}

              <PlanSection icon={<MonitorHeartIcon sx={{ fontSize:'.95rem' }} />} title="Monitoring & Scaling Rules">
                <Stack spacing={.5} sx={{ mt:.5 }}>
                  {[
                    'Health check: GET /health → expect 200, every 10 s',
                    'Alert: HTTP p95 > 800 ms  → notify on-call',
                    'Alert: Error rate > 2%     → PagerDuty + Slack',
                    state.deployMode === 'kubernetes' ? 'HPA: min 2 replicas, max 10, CPU threshold 65%' : 'Restart policy: on-failure, max 3 attempts',
                    'Logs: retained 30 days, indexed in Operational',
                  ].map((r,i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ pt:'.3em', flexShrink:0 }}><Box sx={{ width:5, height:5, borderRadius:'50%', bgcolor: t.brand }} /></Box>
                      <Typography sx={{ fontSize:'.77rem', color:t.textPrimary, fontFamily:FONT }}>{r}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </PlanSection>

              <PlanSection icon={<HistoryIcon sx={{ fontSize:'.95rem' }} />} title="Rollback Strategy">
                <Stack spacing={.5} sx={{ mt:.5 }}>
                  {[
                    'Automatic rollback if health check fails within 90 seconds of deploy',
                    'Previous image retained in Container Registry for 7 days',
                    state.deployMode === 'kubernetes' ? 'kubectl rollout undo deployment/' + plan.proj : `docker stop ${plan.proj} && docker start ${plan.proj}-prev`,
                  ].map((r,i) => <CodeBlock key={i} code={r} />)}
                </Stack>
              </PlanSection>

            </Stack>
          </Box></Fade>
        )}

        {/* ── Step 11: Deploy ── */}
        {step === 11 && (
          <Fade in><Box>
            <StepHeader step={11} title="Deploy" subtitle="Click Deploy to start the pipeline. Logs will stream in real-time." />

            {!deploying && !deployDone && (
              <Box sx={{ mt:3, textAlign:'center' }}>
                <Box sx={{ mb:3, p:'24px', borderRadius:'12px', border:`1px dashed ${t.border}`, display:'inline-flex', flexDirection:'column', alignItems:'center', gap:1.5 }}>
                  <RocketLaunchIcon sx={{ fontSize:'2.5rem', color: t.brand }} />
                  <Typography sx={{ fontSize:'.9rem', fontWeight:700, color:t.textPrimary, fontFamily:FONT }}>Ready to deploy</Typography>
                  <Typography sx={{ fontSize:'.78rem', color:t.textSecondary, fontFamily:FONT, maxWidth:360, textAlign:'center' }}>
                    {plan.proj} will be deployed to <strong style={{ color:t.textPrimary }}>https://{plan.proj.toLowerCase()}.atonixcorp.app</strong>
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt:.5 }} flexWrap="wrap" justifyContent="center">
                    {[plan.fe, plan.be, plan.db, plan.mode].filter(v => v && v !== 'None').map(v => (
                      <Chip key={v} label={v} size="small" sx={{ bgcolor:`${t.brand}18`, color:t.brand, fontFamily:FONT, fontSize:'.7rem', fontWeight:700, border:`1px solid ${t.brand}44`, '& .MuiChip-label':{ px:.7 } }} />
                    ))}
                  </Stack>
                </Box>
                <Button
                  variant="contained" size="large" startIcon={<RocketLaunchIcon />}
                  onClick={runDeploy}
                  sx={{ fontWeight:800, fontSize:'.88rem', borderRadius:'8px', textTransform:'none', fontFamily:FONT,
                    bgcolor: t.brand, color:'#0a0f1a', boxShadow:'0 0 24px rgba(0,224,255,.35)',
                    '&:hover':{ bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow:'0 0 32px rgba(0,224,255,.5)' },
                    px:4, py:1.25 }}>
                  Deploy Now
                </Button>
              </Box>
            )}

            {(deploying || deployDone) && (
              <Box sx={{ mt:2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1 }}>
                  <Typography sx={{ fontSize:'.78rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:FONT }}>
                    Live Deployment Logs
                  </Typography>
                  {deploying && !deployDone && (
                    <Stack direction="row" alignItems="center" spacing={.75}>
                      <CircularProgress size={12} sx={{ color: t.brand }} />
                      <Typography sx={{ fontSize:'.72rem', color: t.brand, fontFamily:FONT }}>Deploying…</Typography>
                    </Stack>
                  )}
                  {deployDone && (
                    <Stack direction="row" alignItems="center" spacing={.75}>
                      <CheckCircleIcon sx={{ fontSize:'.9rem', color: S.success }} />
                      <Typography sx={{ fontSize:'.75rem', color: S.success, fontWeight:700, fontFamily:FONT }}>Deployment successful</Typography>
                    </Stack>
                  )}
                </Stack>
                <Box ref={logRef} sx={{
                  bgcolor:'rgba(0,0,0,.4)', borderRadius:'10px', border:`1px solid ${t.border}`,
                  p:'12px 16px', height:340, overflowY:'auto',
                  '&::-webkit-scrollbar':{ width:4 },
                  '&::-webkit-scrollbar-thumb':{ bgcolor:t.border, borderRadius:2 },
                }}>
                  {logLines.map((l, i) => <LogLine key={i} text={l.text} type={l.type} />)}
                  {!deployDone && deploying && <LogLine text="_" type="info" />}
                </Box>

                {deployDone && (
                  <Fade in>
                    <Box sx={{ mt:2, p:'16px 20px', borderRadius:'10px', border:`1px solid ${S.success}44`, bgcolor:`${S.success}0a` }}>
                      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb:1.25 }}>
                        <CheckCircleIcon sx={{ fontSize:'1.2rem', color:S.success }} />
                        <Typography sx={{ fontWeight:800, fontSize:'1rem', color:t.textPrimary, fontFamily:FONT }}>
                          {plan.proj} is live 🚀
                        </Typography>
                      </Stack>
                      <Stack spacing={.5} sx={{ mb:2 }}>
                        {[
                          { label:'URL',      value:`https://${plan.proj.toLowerCase()}.atonixcorp.app` },
                          { label:'Image',    value:`registry.atonixcorp.io/${plan.proj}:latest` },
                          { label:'Mode',     value: plan.mode },
                          { label:'Database', value: plan.db },
                          { label:'Branch',   value: state.gitBranch },
                        ].map(r => (
                          <Stack key={r.label} direction="row" spacing={1}>
                            <Typography sx={{ fontSize:'.75rem', color:t.textSecondary, fontFamily:FONT, minWidth:70 }}>{r.label}</Typography>
                            <Typography sx={{ fontSize:'.75rem', color:t.textPrimary, fontFamily:FONT, fontWeight:600 }}>{r.value}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {[
                          { label:'View Operational',  color: t.brand },
                          { label:'View CI/CD Pipeline', color: S.purple },
                          { label:'View Logs',           color: S.info },
                          { label:'View Monitoring',     color: S.success },
                          { label:'Deploy Another',      color: t.textSecondary },
                        ].map(b => (
                          <Button key={b.label} size="small" variant="outlined"
                            sx={{ fontFamily:FONT, fontWeight:700, fontSize:'.74rem', textTransform:'none', borderRadius:'6px',
                              borderColor:`${b.color}55`, color:b.color,
                              '&:hover':{ borderColor:b.color, bgcolor:`${b.color}10` } }}
                            onClick={b.label === 'Deploy Another' ? () => { setState(DEFAULT); setStep(1); setDeploying(false); setDeployDone(false); setLogLines([]) } : undefined}>
                            {b.label}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  </Fade>
                )}
              </Box>
            )}
          </Box></Fade>
        )}

        {/* ── Navigation ── */}
        {step < 11 && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt:3, pt:2, borderTop:`1px solid ${t.border}` }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize:'.85rem' }} />}
              disabled={step === 1}
              onClick={() => setStep(s => s - 1)}
              sx={{ fontFamily:FONT, fontWeight:700, fontSize:'.8rem', textTransform:'none', borderRadius:'7px',
                color: t.textSecondary, border:`1px solid ${t.border}`,
                '&:hover':{ bgcolor:'rgba(255,255,255,.04)' },
                '&.Mui-disabled':{ opacity:.3 }, px:2 }}>
              Back
            </Button>
            <Button
              endIcon={<ArrowForwardIcon sx={{ fontSize:'.85rem' }} />}
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
              variant="contained"
              sx={{ fontFamily:FONT, fontWeight:800, fontSize:'.8rem', textTransform:'none', borderRadius:'7px',
                bgcolor: t.brand, color:'#0a0f1a', boxShadow:'none',
                '&:hover':{ bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow:'none' },
                '&.Mui-disabled':{ bgcolor:`${t.brand}44`, color:'rgba(0,0,0,.4)' }, px:2.5 }}>
              {step === 10 ? 'Proceed to Deploy' : 'Continue'}
            </Button>
          </Stack>
        )}
      </Box>

      {/* ─── Right preview panel ─── */}
      <Box sx={{
        width: 240, flexShrink:0,
        borderLeft:`1px solid ${t.border}`,
        bgcolor: t.surface,
        display:{ xs:'none', lg:'flex' }, flexDirection:'column',
        py:2, px:1.75, overflowY:'auto',
      }}>
        <Typography sx={{ fontSize:'.68rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:FONT, mb:1.5 }}>
          Configuration Preview
        </Typography>

        {/* Current selections */}
        <Stack spacing={.6}>
          {[
            { label:'Source',     val:state.source,     icon:'📡' },
            { label:'App Type',   val:state.appType,    icon:'📦' },
            { label:'Frontend',   val:state.frontend,   icon:'⚛️' },
            { label:'Backend',    val:state.backend,    icon:'⚙️' },
            { label:'Database',   val:state.database,   icon:'🗄️' },
            { label:'Mode',       val:state.deployMode, icon:'🚀' },
            { label:'Project',    val:state.project || state.newProject, icon:'📁' },
            { label:'Branch',     val:state.gitBranch,  icon:'🌿' },
          ].map(r => (
            <Box key={r.label} sx={{ display:'flex', alignItems:'center', gap:.75, py:.45, borderBottom:`1px solid ${t.border}` }}>
              <Typography sx={{ fontSize:'.75rem', lineHeight:1 }}>{r.icon}</Typography>
              <Box sx={{ flex:1, minWidth:0 }}>
                <Typography sx={{ fontSize:'.6rem', color:t.textSecondary, fontFamily:FONT, textTransform:'uppercase', letterSpacing:'.07em' }}>{r.label}</Typography>
                <Typography sx={{ fontSize:'.73rem', color: r.val ? t.textPrimary : t.border, fontFamily:FONT, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {r.val || '—'}
                </Typography>
              </Box>
              {r.val && <CheckCircleIcon sx={{ fontSize:'.7rem', color:S.success, flexShrink:0 }} />}
            </Box>
          ))}
        </Stack>

        <Box sx={{ flex:1 }} />

        {/* Ready indicator */}
        <Box sx={{ mt:2, p:'10px 12px', borderRadius:'8px',
          border:`1px solid ${pct === 100 ? S.success : pct >= 50 ? S.warning : t.border}`,
          bgcolor: pct === 100 ? `${S.success}0d` : 'transparent' }}>
          <Stack direction="row" alignItems="center" spacing={.75} sx={{ mb:.5 }}>
            {pct === 100
              ? <CheckCircleIcon sx={{ fontSize:'.85rem', color:S.success }} />
              : pct >= 50
              ? <WarningAmberIcon sx={{ fontSize:'.85rem', color:S.warning }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize:'.85rem', color:t.border }} />}
            <Typography sx={{ fontSize:'.74rem', fontWeight:700, fontFamily:FONT,
              color: pct===100 ? S.success : pct>=50 ? S.warning : t.textSecondary }}>
              {pct === 100 ? 'Ready to deploy' : pct >= 50 ? 'Almost ready' : 'In progress'}
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={pct}
            sx={{ height:3, borderRadius:2,
              bgcolor: pct===100 ? `${S.success}22` : pct>=50 ? `${S.warning}22` : `${t.brand}22`,
              '& .MuiLinearProgress-bar':{ bgcolor: pct===100 ? S.success : pct>=50 ? S.warning : t.brand, borderRadius:2 } }} />
          <Typography sx={{ fontSize:'.65rem', color:t.textSecondary, fontFamily:FONT, mt:.5 }}>
            {10 - Math.min(step-1, 10)} step{step <= 10 ? 's' : ''} remaining
          </Typography>
        </Box>

        {/* Integration links */}
        <Box sx={{ mt:1.5 }}>
          <Typography sx={{ fontSize:'.65rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:FONT, mb:.75 }}>
            Will integrate with
          </Typography>
          <Stack spacing={.4}>
            {['CI/CD Pipelines','Container Registry','Kubernetes','Monitoring','IAM','Audit Logs','Resource Control','Environment'].map(x => (
              <Stack key={x} direction="row" alignItems="center" spacing={.7}>
                <Box sx={{ width:4, height:4, borderRadius:'50%', bgcolor: t.brand, flexShrink:0 }} />
                <Typography sx={{ fontSize:'.7rem', color:t.textSecondary, fontFamily:FONT }}>{x}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

    </Box>
  )
}

// ─── Step header helper ────────────────────────────────────────────────────────
function StepHeader({ step, title, subtitle }: { step:number; title:string; subtitle:string }) {
  return (
    <Box sx={{ mb:1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:.4 }}>
        <Box sx={{ width:26, height:26, borderRadius:'50%', bgcolor: t.brand, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Typography sx={{ fontSize:'.72rem', fontWeight:800, color:'#0a0f1a', fontFamily:FONT }}>{step}</Typography>
        </Box>
        <Typography sx={{ fontWeight:800, fontSize:'1.08rem', color:t.textPrimary, fontFamily:FONT, letterSpacing:'-.01em' }}>{title}</Typography>
      </Stack>
      <Typography sx={{ fontSize:'.82rem', color:t.textSecondary, fontFamily:FONT, ml:'34px' }}>{subtitle}</Typography>
    </Box>
  )
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
function InfoBanner({ icon, color, children }: { icon:React.ReactNode; color:string; children:React.ReactNode }) {
  return (
    <Box sx={{ display:'flex', alignItems:'flex-start', gap:1, mt:2, p:'10px 14px', borderRadius:'8px',
      border:`1px solid ${color}44`, bgcolor:`${color}0d` }}>
      <Box sx={{ color, pt:'.1em', flexShrink:0 }}>{icon}</Box>
      <Typography sx={{ fontSize:'.78rem', color:t.textPrimary, fontFamily:FONT, lineHeight:1.5 }}>{children}</Typography>
    </Box>
  )
}

// ─── ModeCard (deployment mode step) ─────────────────────────────────────────
function ModeCard({ val, label, icon, selected, onClick, features, recommended, tag }: {
  val:string; label:string; icon:React.ReactNode; selected:boolean; onClick:()=>void;
  features:string[]; recommended:boolean; tag:string
}) {
  return (
    <Box onClick={onClick} sx={{
      flex:'1 1 220px', minWidth:220, maxWidth:320, p:'16px 18px', borderRadius:'12px', cursor:'pointer',
      border:`2px solid ${selected ? t.brand : recommended ? `${t.brand}44` : t.border}`,
      bgcolor: selected ? 'rgba(0,224,255,.08)' : t.surface,
      transition:'all .15s', position:'relative',
      '&:hover':{ borderColor: selected ? t.brand : 'rgba(0,224,255,.6)', bgcolor:'rgba(0,224,255,.04)' },
    }}>
      {recommended && (
        <Chip label="Recommended" size="small" sx={{ position:'absolute', top:10, right:10, height:17, fontSize:'.62rem', fontWeight:700, bgcolor:`${t.brand}22`, color:t.brand, '& .MuiChip-label':{ px:.7 } }} />
      )}
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb:1.5, color: selected ? t.brand : t.textSecondary }}>
        {icon}
        <Typography sx={{ fontWeight:800, fontSize:'.92rem', color:t.textPrimary, fontFamily:FONT }}>{label}</Typography>
      </Stack>
      <Typography sx={{ fontSize:'.7rem', color:t.textSecondary, fontFamily:FONT, mb:1.25 }}>{tag}</Typography>
      <Stack spacing={.6}>
        {features.map((f,i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={.75}>
            <CheckCircleIcon sx={{ fontSize:'.75rem', color: selected ? S.success : t.textSecondary }} />
            <Typography sx={{ fontSize:'.76rem', color:t.textPrimary, fontFamily:FONT }}>{f}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

// ─── Architecture diagram (ASCII-style visual) ────────────────────────────────
function ArchDiagram({ state, plan }: { state:WizardState; plan:ReturnType<typeof buildPlan> }) {
  const nodes = [
    { label:`Git: ${state.gitBranch}`,          color: t.brand,   side:'left' },
    { label:`CI/CD Pipeline`,                   color: S.purple,  side:'left' },
    { label:`Docker Build → Registry`,          color: S.info,    side:'center' },
    { label:`${plan.mode} Deploy`,              color: S.warning, side:'center' },
    { label:`${plan.db} Database`,              color: S.success, side:'right' },
    { label:`Monitoring + Alerts`,              color: S.danger,  side:'right' },
  ]
  return (
    <Stack spacing={.6}>
      {nodes.map((n,i) => (
        <Stack key={i} direction="row" alignItems="center" spacing={1}>
          {i > 0 && <Box sx={{ width:1, height:12, borderLeft:`1.5px dashed ${t.border}`, ml:'10px', mt:'-6px', mb:'-6px', position:'absolute' }} />}
          <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:n.color, flexShrink:0 }} />
          <Box sx={{ flex:1, height:'1px', bgcolor:`${n.color}44` }} />
          <Typography sx={{ fontSize:'.72rem', fontFamily:'monospace', color:n.color, fontWeight:600 }}>{n.label}</Typography>
        </Stack>
      ))}
    </Stack>
  )
}

export default DevDeployAppPage
