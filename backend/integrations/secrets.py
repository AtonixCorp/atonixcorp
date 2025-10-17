import os
import requests


def get_secret(ref: str):
    """Resolve a secret reference.

    Supported formats:
    - env:VAR_NAME -> returns os.environ[VAR_NAME]
    - vault:path/to/secret#key -> queries VAULT_ADDR/v1/<path> using VAULT_TOKEN and returns data['data']['data'][key]
    - if ref is None or empty, return None
    - otherwise return ref (treat as plain secret)
    """
    if not ref:
        return None
    if ref.startswith('env:'):
        var = ref.split(':', 1)[1]
        return os.environ.get(var)
    if ref.startswith('vault:'):
        # format vault:secret/data/path#key  or vault:secret/path#key depending on KV engine
        vault_addr = os.environ.get('VAULT_ADDR')
        vault_token = os.environ.get('VAULT_TOKEN')
        if not vault_addr or not vault_token:
            return None
        path_key = ref.split(':', 1)[1]
        if '#' in path_key:
            path, key = path_key.split('#', 1)
        else:
            path, key = path_key, 'value'
        url = vault_addr.rstrip('/') + '/v1/' + path.lstrip('/')
        try:
            r = requests.get(url, headers={'X-Vault-Token': vault_token}, timeout=5)
            r.raise_for_status()
            j = r.json()
            # KV v2 nests under data.data
            if isinstance(j.get('data'), dict) and 'data' in j['data']:
                return j['data']['data'].get(key)
            return j.get('data', {}).get(key)
        except Exception:
            return None
    # fallback: return the literal
    return ref
