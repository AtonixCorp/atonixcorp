import os
import tempfile
from django.conf import settings


def _get_fernet():
    """Lazily import and return a Fernet instance using GPG_FERNET_KEY.

    This avoids importing cryptography at module import time so Django can
    start in environments where cryptography isn't installed (e.g., during
    lightweight checks). If cryptography is missing, raise ImportError with
    a clear message.
    """
    try:
        from cryptography.fernet import Fernet
    except Exception as e:  # pragma: no cover - environment-dependent
        raise ImportError("Missing dependency 'cryptography'. Install it to enable GPG private key encryption.") from e

    FERNET_KEY = getattr(settings, 'GPG_FERNET_KEY', None) or os.environ.get('GPG_FERNET_KEY')
    if not FERNET_KEY:
        # For development only: create a volatile key. In production, set GPG_FERNET_KEY.
        FERNET_KEY = Fernet.generate_key().decode()

    return Fernet(FERNET_KEY.encode())


def generate_gpg_keypair(name_email: str, passphrase: str = ''):
    """Generate a GPG keypair and return (fingerprint, public_key, encrypted_private_key).

    - name_email: a string like 'Alice <alice@example.com>' used as user id
    - passphrase: optional passphrase for the private key
    """
    # Import gnupg lazily so the module can be imported without python-gnupg
    # being installed. Raise a helpful error if it's missing.
    try:
        import gnupg
    except Exception as e:  # pragma: no cover - environment-dependent
        raise ImportError("Missing dependency 'python-gnupg'. Install it to enable server-side GPG key generation.") from e

    g = gnupg.GPG()

    input_data = g.gen_key_input(
        name_email=name_email,
        passphrase=passphrase,
        key_type='RSA',
        key_length=2048,
    )

    key = g.gen_key(input_data)
    if not key:
        raise RuntimeError('GPG key generation failed')

    fingerprint = key.fingerprint
    public_key = g.export_keys(fingerprint)
    private_key = g.export_keys(fingerprint, True, passphrase=passphrase)

    # Encrypt private key at rest with Fernet
    fernet = _get_fernet()
    encrypted_private = fernet.encrypt(private_key.encode()).decode()

    # Return fingerprint, public key, encrypted private key (for DB) and
    # the plaintext private key so callers can provide a one-time export.
    return fingerprint, public_key, encrypted_private, private_key


def decrypt_private_key(encrypted_private_key: str) -> str:
    """Decrypt the stored encrypted private key. Returns plaintext private key (careful)."""
    fernet = _get_fernet()
    return fernet.decrypt(encrypted_private_key.encode()).decode()
