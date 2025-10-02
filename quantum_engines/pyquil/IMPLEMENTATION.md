# PyQuil Client Implementation

This document describes the PyQuil client implementation for the AtonixCorp platform.

## Overview

The PyQuil client (`backend/core/quantum_engines/pyquil_client.py`) provides a wrapper for executing Quil quantum programs using the PyQuil library and Rigetti's Quantum Virtual Machine (QVM).

## Features

### Supported Gates

The implementation supports the following quantum gates:

#### Single-Qubit Gates
- **H** (Hadamard): Creates superposition
  ```
  H 0
  ```

- **X, Y, Z** (Pauli gates): Bit-flip, Y-rotation, phase-flip
  ```
  X 0
  Y 1
  Z 2
  ```

- **RX, RY, RZ** (Rotation gates): Parameterized rotations around X, Y, Z axes
  ```
  RX(1.5708) 0
  RY(3.1416) 1
  RZ(0.7854) 2
  ```

#### Two-Qubit Gates
- **CNOT/CX** (Controlled-NOT): Creates entanglement
  ```
  CNOT 0 1
  CX 0 1
  ```

### Program Format

Programs are specified as text strings with one instruction per line:

```python
program = """
H 0          # Create superposition on qubit 0
CNOT 0 1     # Entangle qubits 0 and 1
"""
```

Comments are supported using the `#` character.

## Usage

### Basic Example

```python
from core.quantum_engines import pyquil_client

# Simple Hadamard gate
program = "H 0"
result = pyquil_client.submit(program, shots=1024)
print(result)
# Output: {'counts': {'0': 512, '1': 512}, 'shots': 1024}
```

### Bell State Example

```python
# Create a Bell state (maximally entangled pair)
program = """
H 0
CNOT 0 1
"""
result = pyquil_client.submit(program, shots=1000)
print(result)
# Output: {'counts': {'00': 500, '11': 500}, 'shots': 1000}
```

### Via Quantum Engine Manager

```python
from core.quantum_engines import manager

payload = {
    'program': 'H 0\nCNOT 0 1',
    'shots': 1024
}
result = manager.submit('pyquil', payload)
```

## Return Format

The `submit()` function returns a dictionary with:

- **counts**: Dictionary mapping bitstrings to their occurrence counts
  - Keys: Bitstrings like "00", "01", "10", "11"
  - Values: Number of times that outcome was measured
- **shots**: Total number of shots executed
- **note** (optional): Warning message if QVM is not available

Example:
```python
{
    'counts': {'00': 256, '01': 268, '10': 250, '11': 250},
    'shots': 1024
}
```

## Error Handling

### PyQuil Not Installed

If PyQuil is not installed, the function raises:
```python
RuntimeError: PyQuil not installed
```

### QVM Not Available

If PyQuil is installed but QVM is not running, the function returns simulated results with a note:
```python
{
    'counts': {'00': 256, '01': 256, '10': 256, '11': 256},
    'shots': 1024,
    'note': 'QVM not available, returning simulated result: ...'
}
```

### Invalid Syntax

Malformed lines are skipped gracefully. The parser continues processing valid gates.

## Installation

To use the PyQuil client, install PyQuil:

```bash
pip install pyquil
```

To run programs on a local QVM, you'll need to install and run the Rigetti QVM:

```bash
# Install quilc and qvm
# Follow instructions at: https://pyquil-docs.rigetti.com/en/stable/start.html

# Start the QVM
qvm -S

# Start the compiler (in another terminal)
quilc -S
```

## Integration with Quantum Service

The PyQuil client integrates with the platform's quantum service architecture:

1. Client submits job via `/api/quantum/submit` endpoint
2. Request routed to quantum_service FastAPI microservice
3. Quantum service delegates to appropriate engine via manager
4. PyQuil client executes program and returns results
5. Results returned to client

## Testing

The implementation has been tested with:
- Simple single-qubit gates
- Multi-qubit entanglement (Bell states)
- Parameterized rotation gates
- Comment handling
- Error conditions (PyQuil not installed, QVM not available)

## Limitations

This is a demo implementation with some limitations:

1. **Gate Set**: Only supports basic gates (H, X, Y, Z, RX, RY, RZ, CNOT)
2. **Parser**: Simple text parser - not a full Quil parser
3. **Measurements**: Automatically adds measurements to all qubits
4. **Error Handling**: Skips malformed instructions rather than failing

For production use, consider:
- Using the full Quil parser
- Supporting the complete gate set
- Adding validation and better error messages
- Supporting custom measurement specifications
- Integrating with Rigetti's cloud services

## See Also

- [PyQuil Documentation](https://pyquil-docs.rigetti.com/)
- [Quil Specification](https://github.com/quil-lang/quil)
- Platform quantum engines: `backend/core/quantum_engines/`
- Quantum service: `quantum_service/main.py`
