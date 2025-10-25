"""
Configuration management for HTB Helper
Supports loading configuration from YAML files
"""

import os
import yaml
from pathlib import Path

class Config:
    """Configuration manager for HTB Helper."""
    
    DEFAULT_CONFIG = {
        'general': {
            'base_dir': 'htb',
            'log_file': 'error_log.txt',
            'info_log': 'htb_helper.log',
        },
        'nmap': {
            'threads': 50,
            'timeout': 300,
            'default_ports': 'all',
            'scripts_path': '/usr/share/nmap/scripts',
        },
        'payloads': {
            'default_lport': 4444,
            'output_format': {
                'windows': 'exe',
                'linux': 'elf',
            }
        },
        'tools': {
            'repos': [
                'https://github.com/carlospolop/PEASS-ng',
                'https://github.com/danielmiessler/SecLists',
                'https://github.com/cywf/aliases',
            ]
        },
        'wordlists': {
            'default': '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
            'parameters': '/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt',
        }
    }
    
    def __init__(self, config_file=None):
        """
        Initialize configuration.
        
        Args:
            config_file: Path to configuration file (optional)
        """
        self.config = self.DEFAULT_CONFIG.copy()
        
        if config_file and os.path.exists(config_file):
            self.load_config(config_file)
        else:
            # Try to load from default locations
            default_locations = [
                'htb_helper.yaml',
                'htb_helper.yml',
                os.path.expanduser('~/.htb_helper.yaml'),
                os.path.expanduser('~/.config/htb_helper/config.yaml'),
            ]
            
            for location in default_locations:
                if os.path.exists(location):
                    self.load_config(location)
                    break
    
    def load_config(self, config_file):
        """Load configuration from YAML file."""
        try:
            with open(config_file, 'r') as f:
                user_config = yaml.safe_load(f)
                if user_config:
                    # Deep merge user config with defaults
                    self._deep_merge(self.config, user_config)
                print(f"✓ Loaded configuration from {config_file}")
        except Exception as e:
            print(f"⚠ Warning: Could not load config file {config_file}: {e}")
    
    def _deep_merge(self, base, update):
        """Deep merge two dictionaries."""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def get(self, *keys, default=None):
        """
        Get configuration value using dot notation.
        
        Args:
            *keys: Keys to traverse (e.g., 'nmap', 'threads')
            default: Default value if key not found
            
        Returns:
            Configuration value or default
        """
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value
    
    def set(self, value, *keys):
        """
        Set configuration value using dot notation.
        
        Args:
            value: Value to set
            *keys: Keys to traverse
        """
        config = self.config
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        config[keys[-1]] = value
    
    def save(self, config_file):
        """Save current configuration to YAML file."""
        Path(config_file).parent.mkdir(parents=True, exist_ok=True)
        
        with open(config_file, 'w') as f:
            yaml.dump(self.config, f, default_flow_style=False, sort_keys=False)
        
        print(f"✓ Configuration saved to {config_file}")
    
    def create_example_config(self, output_file='htb_helper.example.yaml'):
        """Create an example configuration file."""
        with open(output_file, 'w') as f:
            f.write("""# HTB Helper Configuration File
# Copy this file to htb_helper.yaml and customize as needed

general:
  base_dir: htb
  log_file: error_log.txt
  info_log: htb_helper.log

nmap:
  threads: 50
  timeout: 300
  default_ports: all
  scripts_path: /usr/share/nmap/scripts

payloads:
  default_lport: 4444
  output_format:
    windows: exe
    linux: elf

tools:
  repos:
    - https://github.com/carlospolop/PEASS-ng
    - https://github.com/danielmiessler/SecLists
    - https://github.com/cywf/aliases

wordlists:
  default: /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
  parameters: /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt
""")
        print(f"✓ Example configuration file created: {output_file}")

# Global configuration instance
_config = None

def get_config(config_file=None):
    """Get global configuration instance."""
    global _config
    if _config is None:
        _config = Config(config_file)
    return _config
