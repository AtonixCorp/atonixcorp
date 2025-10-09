"""Minimal Qiskit client wrapper (demo)."""
try:
    from qiskit import QuantumCircuit, Aer, execute
except Exception:
    QuantumCircuit = None


def submit(circuit_text: str, shots: int = 1024):
    """Submit a simple circuit description. This demo expects circuit_text to be
    a newline separated list of gates like: 'h 0\ncx 0 1'. Convert to Qiskit circuit manually.
    """
    if QuantumCircuit is None:
        raise RuntimeError('Qiskit not installed')

    lines = [ln.strip() for ln in circuit_text.splitlines() if ln.strip()]
    # Very naive parser for demo
    qc = QuantumCircuit(2)
    for ln in lines:
        parts = ln.split()
        if parts[0].lower() in ('h', 'hgate'):
            qc.h(int(parts[1]))
        if parts[0].lower() in ('cx', 'cnot'):
            qc.cx(int(parts[1]), int(parts[2]))

    backend = Aer.get_backend('aer_simulator')
    job = execute(qc, backend=backend, shots=shots)
    result = job.result()
    return {'counts': result.get_counts(), 'shots': shots}
