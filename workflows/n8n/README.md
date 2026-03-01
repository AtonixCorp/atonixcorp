# n8n – Business Automation Workflows

n8n handles business-level event routing, 3rd-party integrations, and notification automation. Equivalent to AWS EventBridge + Lambda for non-technical workflows.

## Deployment

n8n runs as a Kubernetes Deployment in the `workflows` namespace.

```bash
# Apply n8n deployment
kubectl apply -f workflows/n8n/deployment.yaml -n workflows
```

## Workflow Exports

All n8n workflows are exported as JSON and stored in `workflows/n8n/exports/`. Import via:

1. n8n UI → _Import from file_
2. Or via n8n CLI: `n8n import:workflow --input=exports/<workflow>.json`

## Standard Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `alert-to-slack.json` | Alertmanager webhook | Post alert to Slack channel |
| `vm-provisioned-notify.json` | OpenStack event | Send onboarding email to user |
| `workflow-failure-ticket.json` | Argo Workflows webhook | Create Jira/GitLab issue |
| `billing-threshold-notify.json` | Cron / billing API | Notify account owner of spend threshold |
| `new-user-onboard.json` | Identity event | Provision namespace + send welcome |

## Rules

1. **All credentials stored in n8n Credential store** — never hardcoded in workflow JSON.
2. **All workflows exported to Git** after any change.
3. **n8n must not bypass the Keystone identity model** — use service accounts for API calls.
4. **n8n is monitored by Prometheus** — scrape `/metrics` on port 5678.
