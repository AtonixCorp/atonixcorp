"""Minimal PennyLane client wrapper (demo)."""
try:
    import pennylane as qml
except Exception:
    qml = None


def submit(circuit_spec: str, shots: int = 1024):
    if qml is None:
        raise RuntimeError('PennyLane not installed')

    # Placeholder: implement parsing and execution via pennylane device
    return {'result': 'pennylane placeholder'}
