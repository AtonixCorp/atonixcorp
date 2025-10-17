import os
import tempfile
from integrations.secrets import get_secret


def test_get_secret_env(monkeypatch):
    monkeypatch.setenv('TEST_SECRET_VAR', 'supersecret')
    assert get_secret('env:TEST_SECRET_VAR') == 'supersecret'


def test_get_secret_plain():
    assert get_secret('literalvalue') == 'literalvalue'


def test_get_secret_none():
    assert get_secret('') is None or get_secret(None) is None
