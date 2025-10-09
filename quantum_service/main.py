from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import time
import threading

app = FastAPI(title="AtonixCorp Quantum Service (demo)")

# Simple in-memory store for jobs (demo only)
JOBS = {}

class QuantumJob(BaseModel):
    circuit: str
    shots: int = 1024
    backend: str = 'simulator'

@app.post('/submit')
async def submit(job: QuantumJob):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {
        'id': job_id,
        'status': 'queued',
        'circuit': job.circuit,
        'backend': job.backend,
        'shots': job.shots,
        'submitted_at': time.time(),
        'result': None,
    }

    # Simulate async processing in background thread
    def worker(jid, payload):
        time.sleep(2)  # simulate queue
        JOBS[jid]['status'] = 'running'
        time.sleep(2)  # simulate execution
        # Fake result
        JOBS[jid]['result'] = {
            'counts': {'00': 512, '11': 512},
            'shots': payload['shots']
        }
        JOBS[jid]['status'] = 'completed'

    threading.Thread(target=worker, args=(job_id, JOBS[job_id]), daemon=True).start()

    return {'job_id': job_id, 'status': 'queued'}

@app.get('/status/{job_id}')
async def status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail='Job not found')
    return JOBS[job_id]
