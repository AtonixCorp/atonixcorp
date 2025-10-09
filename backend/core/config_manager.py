"""
Configuration management using Zookeeper.
"""
import json
import logging
from typing import Dict, Any, Optional
from core.zookeeper_client import get_zk_client


logger = logging.getLogger(__name__)


class ConfigManager:
    """Manage application configuration using Zookeeper."""
    
    def __init__(self, app_name: str = 'atonixcorp'):
        self.app_name = app_name
        self.base_path = f"/config/{app_name}"
        self.zk_client = get_zk_client()
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a configuration setting from Zookeeper."""
        path = f"{self.base_path}/{key}"
        config = self.zk_client.get_config(path)
        
        if config and 'value' in config:
            return config['value']
        
        return default
    
    def set_setting(self, key: str, value: Any, description: str = ""):
        """Set a configuration setting in Zookeeper."""
        path = f"{self.base_path}/{key}"
        config_data = {
            'value': value,
            'description': description,
            'type': type(value).__name__
        }
        
        self.zk_client.set_config(path, config_data)
        logger.info(f"Set config {key} = {value}")
    
    def get_all_settings(self) -> Dict[str, Any]:
        """Get all configuration settings for the application."""
        settings = {}
        
        try:
            children = self.zk_client.get_children(self.base_path)
            for child in children:
                path = f"{self.base_path}/{child}"
                config = self.zk_client.get_config(path)
                if config and 'value' in config:
                    settings[child] = config['value']
        except Exception as e:
            logger.error(f"Failed to get all settings: {e}")
        
        return settings
    
    def remove_setting(self, key: str):
        """Remove a configuration setting from Zookeeper."""
        path = f"{self.base_path}/{key}"
        self.zk_client.delete_node(path)
        logger.info(f"Removed config setting: {key}")
    
    def watch_setting(self, key: str, callback):
        """Watch for changes to a configuration setting."""
        path = f"{self.base_path}/{key}"
        
        def config_callback(config_data):
            if 'value' in config_data:
                callback(config_data['value'])
        
        self.zk_client.watch_config(path, config_callback)
        logger.info(f"Started watching config setting: {key}")


# Global config manager instance
_config_manager = None


def get_config_manager() -> ConfigManager:
    """Get or create global config manager instance."""
    global _config_manager
    if _config_manager is None:
        _config_manager = ConfigManager()
    return _config_manager