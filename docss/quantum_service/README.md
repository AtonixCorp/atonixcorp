# Quantum Service (development)

This folder contains a small example FastAPI microservice that simulates a quantum computing job queue. It's intended as a development scaffold and integration example only — not production-ready quantum infrastructure.

Features
- Submit a simulated quantum job via POST /submit
- Query job status via GET /status/{job_id}
- Simple in-memory job store (for demo)

Run locally (development)

1. Create and activate a virtualenv

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Start the service (defaults to port 8001)

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

3. Example usage

Submit a job:

```bash
curl -X POST "http://localhost:8001/submit" -H "Content-Type: application/json" -d '{"circuit": "H 0; CX 0 1"}'
```

Check status:

```bash
curl http://localhost:8001/status/<job_id>
```

Notes
- Replace this stub with a real quantum backend integration (Qiskit, Amazon Braket, IonQ, Azure Quantum, etc.) when ready.
- In production, prefer a separate, secured service with job persistence and real device/API integrations.
