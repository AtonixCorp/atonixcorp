#!/bin/bash

# Start cron daemon in background
cron

# Start Sidekiq worker
bundle exec sidekiq