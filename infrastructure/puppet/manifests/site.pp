# Puppet site manifest for AtonixCorp Platform
# Main entry point for Puppet configuration

# Global defaults
Exec {
  path => ['/usr/local/bin', '/usr/bin', '/bin', '/usr/local/sbin', '/usr/sbin', '/sbin'],
}

# Node classifications
node default {
  include atonixcorp::platform
  include atonixcorp::security
  include atonixcorp::monitoring
}

# Development environment nodes
node /^dev-.*/ {
  $environment = 'development'
  include atonixcorp::platform
  include atonixcorp::security
  
  # Development-specific configurations
  class { 'atonixcorp::platform':
    debug_mode => true,
    log_level  => 'debug',
  }
}

# Production environment nodes
node /^prod-.*/ {
  $environment = 'production'
  include atonixcorp::platform
  include atonixcorp::security
  include atonixcorp::monitoring
  
  # Production-specific configurations
  class { 'atonixcorp::platform':
    debug_mode       => false,
    log_level        => 'warning',
    enable_ssl       => true,
    backup_enabled   => true,
  }
}

# Staging environment nodes
node /^staging-.*/ {
  $environment = 'staging'
  include atonixcorp::platform
  include atonixcorp::security
  
  class { 'atonixcorp::platform':
    debug_mode => false,
    log_level  => 'info',
    enable_ssl => true,
  }
}