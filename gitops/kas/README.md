# KAS (Kubernetes Agent Server) Integration for AtonixCorp

This directory contains the complete KAS integration for secure CI/CD & GitOps workflows with AtonixCorp's declarative approach for quantum-safe modules.

## Overview

KAS provides a secure agent server that integrates with ArgoCD and Tekton to automate deployments of quantum-safe modules while enforcing CRD readiness and cleanup logic.

## Components

### 1. KAS Agent Server (`kas-deployment.yaml`)
- **Deployment**: Main KAS agent server with quantum-safe configurations
- **Service**: Exposes KAS API endpoints
- **Ingress**: External access with TLS termination
- **RBAC**: ClusterRole and ClusterRoleBinding for necessary permissions
- **Secrets**: Secure storage for tokens, certificates, and keys

### 2. ArgoCD ApplicationSets (`quantum-applicationsets.yaml`)
- **Quantum Modules**: ApplicationSet for deploying quantum-safe modules (PennyLane, Qiskit, PyQuil, QuTiP)
- **CRDs**: Separate ApplicationSet for Custom Resource Definitions with proper sync waves
- **Operators**: ApplicationSet for quantum operators with dependency management

### 3. Tekton Pipelines (`quantum-pipelines.yaml`)
- **Deployment Pipeline**: Complete CI/CD pipeline for quantum module deployment
- **Cleanup Pipeline**: Safe cleanup pipeline with CRD removal logic
- **CRD Readiness**: Automated checks for CRD establishment and names acceptance
- **Dependency Validation**: Checks for conflicting CRDs and prerequisites

### 4. Tekton Tasks (`quantum-tasks.yaml`)
- **CRD Readiness Check**: Validates CRD establishment and conditions
- **CRD Dependencies**: Checks for conflicts and prerequisites
- **CRD Cleanup**: Safe CRD removal with finalizer handling
- **Quantum Tests**: Module-specific testing for quantum operations

### 5. Webhook Configuration (`kas-webhooks.yaml`)
- **Deployment Webhooks**: Automated quantum module deployment triggers
- **Cleanup Webhooks**: Safe cleanup with CRD removal
- **GitOps Sync**: ArgoCD synchronization triggers
- **Security Scanning**: Automated security validation
- **Monitoring**: PrometheusRule for webhook health and failures

## Supported Quantum Modules

| Module | CRD | Description | Readiness Endpoint |
|--------|-----|-------------|-------------------|
| PennyLane | `pennylane.atnixcorp.com` | Quantum machine learning | `/health` |
| Qiskit | `qiskit.atnixcorp.com` | Quantum computing framework | `/quantum/status` |
| PyQuil | `pyquil.atnixcorp.com` | Rigetti quantum programming | `/api/v1/health` |
| QuTiP | `qutip.atnixcorp.com` | Quantum information processing | `/status` |

## Deployment Instructions

### Prerequisites
1. ArgoCD installed and configured
2. Tekton Pipelines installed
3. cert-manager for TLS certificates
4. Prometheus for monitoring

### 1. Deploy KAS Agent Server
```bash
kubectl apply -f gitops/kas/kas-deployment.yaml
```

### 2. Configure Secrets
Update the `kas-secrets` Secret with your actual values:
- `argocd-token`: ArgoCD authentication token
- `tekton-token`: Tekton service account token
- `webhook-secret`: HMAC secret for webhook authentication
- `tls-cert`, `tls-key`, `ca-cert`: TLS certificates

### 3. Deploy ArgoCD ApplicationSets
```bash
kubectl apply -f gitops/argocd/quantum-applicationsets.yaml
```

### 4. Deploy Tekton Pipelines and Tasks
```bash
kubectl apply -f infrastructure/tekton/pipelines/quantum-pipelines.yaml
kubectl apply -f infrastructure/tekton/tasks/quantum-tasks.yaml
```

### 5. Configure Webhooks
```bash
kubectl apply -f gitops/kas/kas-webhooks.yaml
```

## Usage Examples

### Deploy Quantum Module via Webhook
```bash
curl -X POST https://kas-webhooks.atonixcorp.com/webhook/quantum-deploy \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d '{
    "module": {
      "name": "pennylane",
      "version": "0.30.0"
    },
    "environment": "staging",
    "namespace": "atonixcorp-quantum-staging",
    "crd": {
      "name": "pennylane.atnixcorp.com"
    },
    "source": {
      "repo_url": "https://github.com/atonixcorp/atonixcorp.git",
      "revision": "main"
    }
  }'
```

### Cleanup Quantum Module
```bash
curl -X POST https://kas-webhooks.atonixcorp.com/webhook/quantum-cleanup \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d '{
    "module": {
      "name": "pennylane"
    },
    "environment": "staging",
    "namespace": "atonixcorp-quantum-staging",
    "crd": {
      "name": "pennylane.atnixcorp.com"
    },
    "force_cleanup": false
  }'
```

### Manual Pipeline Execution
```bash
kubectl create -f - <<EOF
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: deploy-pennylane-staging
  namespace: atonixcorp-tekton
spec:
  pipelineRef:
    name: quantum-module-deployment
  params:
  - name: module-name
    value: pennylane
  - name: module-version
    value: "0.30.0"
  - name: environment
    value: staging
  - name: namespace
    value: atonixcorp-quantum-staging
  - name: crd-name
    value: pennylane.atnixcorp.com
  - name: repo-url
    value: https://github.com/atonixcorp/atonixcorp.git
  - name: revision
    value: main
  workspaces:
  - name: shared-data
    volumeClaimTemplate:
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
  - name: kubeconfig
    secret:
      secretName: kubeconfig-secret
EOF
```

## Security Features

### Quantum-Safe Encryption
- AES-256-GCM encryption for sensitive data
- Automatic key rotation every 24 hours
- Hardware Security Module (HSM) integration support

### Authentication & Authorization
- HMAC-based webhook authentication
- mTLS for service-to-service communication
- RBAC with quantum-specific roles
- Token-based ArgoCD and Tekton integration

### Audit & Compliance
- Complete audit logging of all operations
- Compliance with quantum computing security standards
- Integration with existing security monitoring

## Monitoring & Observability

### Metrics
- Webhook request rates and success/failure rates
- CRD readiness check durations
- Quantum module deployment times
- Cleanup operation metrics

### Alerts
- Authentication failure alerts
- Deployment failure notifications
- CRD readiness timeout warnings
- High request rate monitoring

### Logging
- Structured JSON logging
- Integration with Loki for log aggregation
- Debug-level logging for troubleshooting

## Troubleshooting

### Common Issues

1. **CRD Not Ready**: Check the `check-crd-readiness` task logs
2. **Authentication Failures**: Verify webhook secrets and tokens
3. **Deployment Timeouts**: Increase timeout values in pipeline parameters
4. **Resource Conflicts**: Check for conflicting CRDs using dependency checks

### Debug Commands
```bash
# Check KAS pod status
kubectl get pods -n argocd -l app.kubernetes.io/name=kas

# View KAS logs
kubectl logs -n argocd -l app.kubernetes.io/name=kas

# Check ArgoCD applications
kubectl get applications -n argocd

# Monitor Tekton PipelineRuns
kubectl get pipelineruns -n atonixcorp-tekton
```

## Integration with Existing Workflows

The KAS integration extends your existing ArgoCD and Tekton setups:

- **ArgoCD**: Adds quantum-specific ApplicationSets with proper sync waves
- **Tekton**: Adds quantum deployment and cleanup pipelines
- **Monitoring**: Integrates with existing Prometheus and Alertmanager
- **Security**: Works with existing RBAC and network policies

## Future Enhancements

- **Multi-cloud Support**: Deploy quantum modules across multiple cloud providers
- **Auto-scaling**: Dynamic scaling based on quantum workload demands
- **Advanced Scheduling**: Quantum-aware scheduling for optimal performance
- **Backup & Recovery**: Automated backup and disaster recovery for quantum states