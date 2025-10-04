# QuTiP Client Implementation

## Overview

The QuTiP (Quantum Toolbox in Python) client wrapper has been implemented to integrate QuTiP simulations into the AtonixCorp platform's quantum engine manager.

## Implementation Details

### Files Modified

- `backend/core/quantum_engines/qutip_client.py`: Implemented the `submit()` function to properly handle simulation requests

### Key Features

1. **JSON Payload Support**: The `submit()` function accepts both JSON strings and Python dicts as input
2. **Error Handling**: Proper validation and error messages for invalid inputs
3. **API Compatibility**: Maintains compatibility with other quantum engines by accepting a `shots` parameter (though not used for QuTiP simulations)
4. **Simulation Types**: Supports two types of quantum simulations:
   - `rabi`: Rabi oscillation (closed system)
   - `lindblad`: Lindblad master equation (single qubit with relaxation)

### Usage Examples

#### Basic Usage via Manager

```python
from backend.core.quantum_engines.manager import submit

# Define a Rabi simulation
payload = {
    'description': json.dumps({
        "type": "rabi",
        "tlist": [0, 0.5, 1.0, 1.5, 2.0]
    }),
    'shots': 1024  # Included for API compatibility
}

result = submit('qutip', payload)
# Returns: {'status': 'ok', 'expect_sz': [...]}
```

#### Direct Usage

```python
from backend.core.quantum_engines.qutip_client import submit

# Using JSON string
result = submit('{"type": "lindblad", "tlist": [0, 1, 2, 3], "g": 0.2}')

# Using dict directly
result = submit({"type": "rabi", "tlist": [0, 1, 2]})
```

### Payload Format

The description parameter should be a JSON string (or dict) with the following structure:

**For Rabi oscillation:**
```json
{
    "type": "rabi",
    "tlist": [0, 1, 2, 3, 4]
}
```

**For Lindblad master equation:**
```json
{
    "type": "lindblad",
    "tlist": [0, 1, 2, 3, 4],
    "g": 0.1
}
```

### Return Values

On success:
```json
{
    "status": "ok",
    "expect_sz": [1.0, 0.5, -0.5, -1.0, ...]
}
```

On error:
```json
{
    "status": "error",
    "error": "Error description"
}
```

### Error Cases

1. **Invalid JSON**: Returns error if description is not valid JSON
2. **Missing tlist**: Returns error if tlist parameter is not provided
3. **Unknown simulation type**: Returns error for unsupported simulation types
4. **QuTiP not installed**: Raises ImportError if QuTiP is not available

## Testing

The implementation has been tested with:
- Valid JSON payloads for both Rabi and Lindblad simulations
- Direct dict payloads
- Invalid JSON handling
- Missing required parameters
- Unknown simulation types

## Integration

The QuTiP client integrates seamlessly with the quantum engine manager:

```python
from backend.core.quantum_engines.manager import submit

# The manager routes to the appropriate engine
result = submit('qutip', {'description': '{"type": "rabi", "tlist": [0,1,2]}'})
```

## Next Steps

To extend the implementation:
1. Add more simulation types (e.g., quantum trajectories, time-dependent Hamiltonians)
2. Add support for custom Hamiltonians and collapse operators
3. Integrate with job queue for async processing of long-running simulations
4. Add result caching and storage for large simulations
