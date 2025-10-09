"""Quantum engine manager routes requests to the appropriate engine client."""
from typing import Dict

ENGINES = {
    'qiskit': 'backend.core.quantum_engines.qiskit_client',
    'pyquil': 'backend.core.quantum_engines.pyquil_client',
    'qutip': 'backend.core.quantum_engines.qutip_client',
    'pennylane': 'backend.core.quantum_engines.pennylane_client',
}


def submit(engine: str, payload: Dict):
    module_path = ENGINES.get(engine)
    if not module_path:
        raise RuntimeError('Unknown engine')
    module = __import__(module_path, fromlist=['submit'])
    return module.submit(payload.get('circuit') or payload.get('program') or payload.get('description'), payload.get('shots', 1024))
