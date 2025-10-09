import requests
from typing import Any, Dict

QUANTUM_SERVICE_URL = 'http://localhost:8001'


def submit_quantum_job(circuit: str, shots: int = 1024, backend: str = 'simulator') -> Dict[str, Any]:
    payload = {'circuit': circuit, 'shots': shots, 'backend': backend}
    resp = requests.post(f"{QUANTUM_SERVICE_URL}/submit", json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_job_status(job_id: str) -> Dict[str, Any]:
    resp = requests.get(f"{QUANTUM_SERVICE_URL}/status/{job_id}", timeout=10)
    resp.raise_for_status()
    return resp.json()
