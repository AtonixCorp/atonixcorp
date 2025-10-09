:concurrency: ${concurrency}
:timeout: ${timeout}
:queues:
%{ for queue in queues ~}
  - ${queue}
%{ endfor ~}
:schedule:
%{ for key, value in schedule ~}
  ${key}:
    cron: "${value.cron}"
    class: ${value.class}
    args: ${jsonencode(value.args)}
    queue: ${value.queue}
%{ endfor ~}