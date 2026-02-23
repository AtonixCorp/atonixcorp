# AtonixCorp Official Python SDK + CLI

Install locally:

```bash
cd sdk/python
pip install -e .
```

Set auth:

```bash
export ATONIX_BASE_URL=http://localhost:8000
export ATONIX_TOKEN=<your-token>
```

Examples:

```bash
atonixctl instances
atonixctl compliance-controls --framework soc2
atonixctl collect-evidence --framework iso27001
atonixctl graphql --query '{ instances { name status } }'
```
