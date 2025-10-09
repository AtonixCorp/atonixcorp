"""
Encryption utilities for protecting sensitive data
"""
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import secrets
import hashlib
import hmac
from typing import Optional, Union


class EncryptionManager:
    """
    Centralized encryption manager for the platform
    """
    
    def __init__(self):
        self._fernet_key = None
        self._aes_key = None
        self._initialize_keys()
    
    def _initialize_keys(self):
        """Initialize encryption keys from settings"""
        try:
            # Get or generate Fernet key
            fernet_key = getattr(settings, 'ENCRYPTION_KEY', None)
            if not fernet_key:
                # Generate new key for development
                fernet_key = Fernet.generate_key()
                print(f"Generated new encryption key: {fernet_key.decode()}")
                print("Add this to your environment: ENCRYPTION_KEY={fernet_key.decode()}")
            else:
                if isinstance(fernet_key, str):
                    fernet_key = fernet_key.encode()
            
            self._fernet_key = Fernet(fernet_key)
            
            # Initialize AES key from settings
            aes_password = getattr(settings, 'AES_PASSWORD', 'default-aes-password-change-in-production')
            salt = getattr(settings, 'AES_SALT', b'default-salt-change-in-production')
            if isinstance(salt, str):
                salt = salt.encode()
                
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
                backend=default_backend()
            )
            self._aes_key = kdf.derive(aes_password.encode())
            
        except Exception as e:
            raise ImproperlyConfigured(f"Failed to initialize encryption keys: {e}")
    
    def encrypt_field(self, value: Union[str, bytes]) -> str:
        """
        Encrypt a field value using Fernet (symmetric encryption)
        Returns base64 encoded encrypted string
        """
        if not value:
            return ''
        
        if isinstance(value, str):
            value = value.encode('utf-8')
        
        encrypted = self._fernet_key.encrypt(value)
        return base64.b64encode(encrypted).decode('utf-8')
    
    def decrypt_field(self, encrypted_value: str) -> str:
        """
        Decrypt a field value
        Returns original string
        """
        if not encrypted_value:
            return ''
        
        try:
            encrypted_bytes = base64.b64decode(encrypted_value.encode('utf-8'))
            decrypted = self._fernet_key.decrypt(encrypted_bytes)
            return decrypted.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Failed to decrypt value: {e}")
    
    def encrypt_file(self, file_data: bytes) -> bytes:
        """
        Encrypt file data using AES-256-CBC
        """
        if not file_data:
            return b''
        
        # Generate random IV
        iv = os.urandom(16)
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(self._aes_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # Add PKCS7 padding
        padded_data = self._add_padding(file_data)
        
        # Encrypt
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        
        # Prepend IV to encrypted data
        return iv + encrypted_data
    
    def decrypt_file(self, encrypted_data: bytes) -> bytes:
        """
        Decrypt file data
        """
        if not encrypted_data or len(encrypted_data) < 16:
            return b''
        
        # Extract IV and encrypted content
        iv = encrypted_data[:16]
        encrypted_content = encrypted_data[16:]
        
        # Create cipher
        cipher = Cipher(
            algorithms.AES(self._aes_key),
            modes.CBC(iv),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        # Decrypt
        padded_data = decryptor.update(encrypted_content) + decryptor.finalize()
        
        # Remove padding
        return self._remove_padding(padded_data)
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    def hash_password(self, password: str, salt: Optional[str] = None) -> tuple[str, str]:
        """
        Hash password with salt using PBKDF2
        Returns (hash, salt) tuple
        """
        if salt is None:
            salt = secrets.token_hex(16)
        
        pwdhash = hashlib.pbkdf2_hmac('sha256', 
                                      password.encode('utf-8'), 
                                      salt.encode('utf-8'), 
                                      100000)
        return base64.b64encode(pwdhash).decode('utf-8'), salt
    
    def verify_password(self, password: str, hash_value: str, salt: str) -> bool:
        """Verify password against hash"""
        new_hash, _ = self.hash_password(password, salt)
        return hmac.compare_digest(hash_value, new_hash)
    
    def create_hmac(self, message: str, key: Optional[str] = None) -> str:
        """Create HMAC signature for message integrity"""
        if key is None:
            key = getattr(settings, 'SECRET_KEY', 'default-secret-key')
        
        signature = hmac.new(
            key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def verify_hmac(self, message: str, signature: str, key: Optional[str] = None) -> bool:
        """Verify HMAC signature"""
        expected_signature = self.create_hmac(message, key)
        return hmac.compare_digest(signature, expected_signature)
    
    @staticmethod
    def _add_padding(data: bytes) -> bytes:
        """Add PKCS7 padding to data"""
        padding_length = 16 - (len(data) % 16)
        padding = bytes([padding_length] * padding_length)
        return data + padding
    
    @staticmethod
    def _remove_padding(padded_data: bytes) -> bytes:
        """Remove PKCS7 padding from data"""
        padding_length = padded_data[-1]
        return padded_data[:-padding_length]


# Global encryption manager instance
encryption_manager = EncryptionManager()


class EncryptedField:
    """
    Descriptor for automatically encrypting/decrypting model fields
    """
    
    def __init__(self, field_name: str):
        self.field_name = field_name
        self.encrypted_field_name = f"_encrypted_{field_name}"
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        
        encrypted_value = getattr(instance, self.encrypted_field_name, '')
        if not encrypted_value:
            return ''
        
        return encryption_manager.decrypt_field(encrypted_value)
    
    def __set__(self, instance, value):
        if value:
            encrypted_value = encryption_manager.encrypt_field(value)
            setattr(instance, self.encrypted_field_name, encrypted_value)
        else:
            setattr(instance, self.encrypted_field_name, '')


def encrypt_sensitive_data(data: str) -> str:
    """Convenience function for encrypting sensitive data"""
    return encryption_manager.encrypt_field(data)


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Convenience function for decrypting sensitive data"""
    return encryption_manager.decrypt_field(encrypted_data)


def generate_api_key() -> str:
    """Generate secure API key"""
    return encryption_manager.generate_secure_token(48)


def create_secure_hash(data: str) -> str:
    """Create secure hash of data"""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()