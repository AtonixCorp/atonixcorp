"""QuTiP engine client wrapper.

This module provides a minimal `simulate(payload)` function that accepts a
JSON-like payload and performs small example simulations using QuTiP. Imports
are lazy so the module can be imported in environments without QuTiP.

Payload examples:
 - {"type": "rabi", "tlist": [0,1,2], "H": "sx"}
 - {"type": "lindblad", "g": 0.1, "tlist": [0,1,2]}

Return value should be a JSON-serializable dict with keys: status, result.
"""

from typing import Dict, Any


def _import_qutip():
    try:
        import qutip as qp
        return qp
    except Exception as e:  # pragma: no cover - environment dependent
        raise ImportError("QuTiP is not installed. Install `qutip` to run simulations.") from e


def simulate(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Run a small QuTiP simulation described by `payload`.

    Supported types: 'rabi', 'lindblad'. This is intentionally small; extend
    to parse and validate richer inputs in production.
    """
    qp = _import_qutip()
    kind = payload.get('type')

    # Convert tlist
    tlist = payload.get('tlist')
    if tlist is None:
        return {'status': 'error', 'error': 'tlist is required'}

    import numpy as np
    tlist = np.asarray(tlist, dtype=float)

    if kind == 'rabi':
        # Simple Rabi oscillation on a single qubit
        from qutip import sigmax, sigmaz, mesolve

        sx = sigmax()
        sz = sigmaz()
        H = 0.5 * sx
        psi0 = qp.basis(2, 0)
        result = mesolve(H, psi0, tlist, [], [sz])
        return {'status': 'ok', 'expect_sz': [float(x) for x in result.expect[0]]}

    elif kind == 'lindblad':
        # Single qubit relaxation example
        from qutip import mesolve, basis, destroy, sigmaz

        g = float(payload.get('g', 0.1))
        H = 0.5 * sigmaz()
        psi0 = basis(2, 1)
        c_ops = [np.sqrt(g) * destroy(2)]
        result = mesolve(H, psi0, tlist, c_ops, [sigmaz()])
        return {'status': 'ok', 'expect_sz': [float(x) for x in result.expect[0]]}

    else:
        return {'status': 'error', 'error': f'Unknown simulation type: {kind}'}


def submit(description: str, shots: int = 1024):
    """Submit a QuTiP simulation job.
    
    The description parameter should be a JSON string describing the simulation,
    e.g., '{"type": "rabi", "tlist": [0, 1, 2]}' or a dict-like payload.
    
    Args:
        description: JSON string or description of simulation to run
        shots: Not used for QuTiP simulations (included for API compatibility)
        
    Returns:
        Dict with simulation results
    """
    import json
    
    # Parse description if it's a string
    if isinstance(description, str):
        try:
            payload = json.loads(description)
        except json.JSONDecodeError:
            # If not valid JSON, return error
            return {'status': 'error', 'error': 'description must be valid JSON'}
    elif isinstance(description, dict):
        payload = description
    else:
        return {'status': 'error', 'error': 'description must be a JSON string or dict'}
    
    # Call the simulate function with the payload
    return simulate(payload)
