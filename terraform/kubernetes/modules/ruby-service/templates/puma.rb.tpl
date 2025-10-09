environment ENV.fetch('${rack_env}', 'production')
bind ENV.fetch('${bind}', 'tcp://0.0.0.0:${port}')
port ENV.fetch('${port}', ${port})
workers ENV.fetch('${workers}', ${workers}).to_i
threads ENV.fetch('${min_threads}', ${min_threads}).to_i, ENV.fetch('${max_threads}', ${max_threads}).to_i
preload_app! if ENV.fetch('${preload_app}', '${preload_app}') == 'true'
worker_timeout 3600
worker_boot_timeout 60
on_worker_boot do
  require_relative 'config/database'
  require_relative 'config/redis'
  require_relative 'config/zookeeper'
end
