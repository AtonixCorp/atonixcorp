#!/bin/bash

#!/bin/bash

# Start cron as root to allow it to create /var/run/crond.pid, then start puma
# as the app user by using su-exec or gosu if available. We will start cron and
# then run puma in the foreground.

# Run puma in foreground
exec bundle exec puma -C config/puma.rb -R config.ru