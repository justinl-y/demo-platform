#!/bin/bash

mkdir -p /var/log/eb-docker/containers/nginx-proxy/healthd
chmod -R 777 /var/log/eb-docker/containers/nginx-proxy/healthd

if [ -d "/etc/healthd" ]
then
  replacement="/var/log/eb-docker/containers/nginx-proxy/healthd/application.log"

  sed -i "s|appstat_log_path:.*|appstat_log_path: $replacement|g" /etc/healthd/config.yaml
  sed 's/appstat_unit:.*/appstat_unit: sec/g' /etc/healthd/config.yaml
  sed 's/appstat_timestamp_on:.*/appstat_timestamp_on: completion/g' /etc/healthd/config.yaml

  systemctl restart healthd.service
fi
