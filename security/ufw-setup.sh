#!/bin/bash
set -e

echo "[+] Enabling UFW..."
sudo ufw --force enable

echo "[+] Setting default policies..."
sudo ufw default deny incoming
sudo ufw default allow outgoing

echo "[+] Allowing SSH for remote access..."
sudo ufw allow 22/tcp comment 'SSH access'

echo "[+] Allowing DNS for Dnsmasq..."
sudo ufw allow 53/udp comment 'DNS (udp)'
sudo ufw allow 53/tcp comment 'DNS (tcp)'

echo "[+] Allowing OVN northbound/southbound DB ports..."
sudo ufw allow 6641/tcp comment 'OVN Northbound DB'
sudo ufw allow 6642/tcp comment 'OVN Southbound DB'

echo "[+] Allowing Docker bridge traffic..."
sudo ufw allow in on docker0 comment 'Docker bridge ingress'
sudo ufw allow out on docker0 comment 'Docker bridge egress'

echo "[+] Allowing internal bridge traffic (br-int)..."
sudo ufw allow in on br-int comment 'OVN integration bridge ingress'
sudo ufw allow out on br-int comment 'OVN integration bridge egress'

echo "[+] Allowing local subnet (192.168.146.0/24)..."
sudo ufw allow from 192.168.146.0/24 comment 'Local subnet access'

echo "[+] Reloading UFW..."
sudo ufw reload

echo "[✓] UFW firewall configured successfully."