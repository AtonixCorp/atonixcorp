# AtonixCorp Platform main module
# Manages the core platform deployment and configuration

class atonixcorp::platform (
  Boolean $debug_mode = false,
  String $log_level = 'info',
  Boolean $enable_ssl = false,
  Boolean $backup_enabled = false,
  String $platform_version = 'latest',
  String $database_password = 'atonixpass',
  Hash $environment_vars = {},
) {

  # Ensure required packages are installed
  ensure_packages([
    'docker.io',
    'docker-compose',
    'git',
    'curl',
    'wget',
    'unzip',
  ])

  # Create platform user
  user { 'atonixcorp':
    ensure     => present,
    home       => '/opt/atonixcorp',
    shell      => '/bin/bash',
    managehome => true,
    system     => true,
  }

  # Create platform directories
  file { ['/opt/atonixcorp', '/opt/atonixcorp/platform', '/opt/atonixcorp/logs', '/opt/atonixcorp/data']:
    ensure  => directory,
    owner   => 'atonixcorp',
    group   => 'atonixcorp',
    mode    => '0755',
    require => User['atonixcorp'],
  }

  # Deploy platform repository
  vcsrepo { '/opt/atonixcorp/platform':
    ensure   => present,
    provider => git,
    source   => 'https://github.com/atonixdev/atonixcorp-platform.git',
    user     => 'atonixcorp',
    require  => [User['atonixcorp'], File['/opt/atonixcorp/platform']],
  }

  # Platform environment configuration
  file { '/opt/atonixcorp/platform/.env':
    ensure  => file,
    owner   => 'atonixcorp',
    group   => 'atonixcorp',
    mode    => '0600',
    content => template('atonixcorp/platform.env.erb'),
    require => Vcsrepo['/opt/atonixcorp/platform'],
    notify  => Service['atonixcorp-platform'],
  }

  # Docker Compose configuration
  file { '/opt/atonixcorp/platform/docker-compose.production.yml':
    ensure  => file,
    owner   => 'atonixcorp',
    group   => 'atonixcorp',
    mode    => '0644',
    content => template('atonixcorp/docker-compose.production.yml.erb'),
    require => Vcsrepo['/opt/atonixcorp/platform'],
    notify  => Service['atonixcorp-platform'],
  }

  # Systemd service for platform
  file { '/etc/systemd/system/atonixcorp-platform.service':
    ensure  => file,
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    content => template('atonixcorp/atonixcorp-platform.service.erb'),
    notify  => [Exec['systemd-reload'], Service['atonixcorp-platform']],
  }

  # Reload systemd
  exec { 'systemd-reload':
    command     => 'systemctl daemon-reload',
    refreshonly => true,
  }

  # Platform service
  service { 'atonixcorp-platform':
    ensure  => running,
    enable  => true,
    require => [
      File['/etc/systemd/system/atonixcorp-platform.service'],
      File['/opt/atonixcorp/platform/.env'],
      Exec['systemd-reload'],
    ],
  }

  # Backup configuration
  if $backup_enabled {
    include atonixcorp::backup
  }

  # SSL configuration
  if $enable_ssl {
    include atonixcorp::ssl
  }

  # Log rotation
  file { '/etc/logrotate.d/atonixcorp-platform':
    ensure  => file,
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    content => template('atonixcorp/logrotate.conf.erb'),
  }

  # Health check script
  file { '/usr/local/bin/atonixcorp-health-check':
    ensure  => file,
    owner   => 'root',
    group   => 'root',
    mode    => '0755',
    content => template('atonixcorp/health-check.sh.erb'),
  }

  # Cron job for health checks
  cron { 'atonixcorp-health-check':
    command => '/usr/local/bin/atonixcorp-health-check',
    user    => 'atonixcorp',
    minute  => '*/5',  # Every 5 minutes
    require => File['/usr/local/bin/atonixcorp-health-check'],
  }
}