# 0.4.4 Sam Black

- `rsync` uses a larger buffer than regular commands we `exec`
- `rsync` verbosity can be set with the `VERBOSITY_RSYNC` option
- `npm` verbosity can be set with the `VERBOSITY_NPM` option
- Fixed bug when defaulting to use the `defaults.rsyncignore` file
- Elastic IP assignment is now _optional_, but enabled by default

# 0.4.3 Wild Boar

- Collect insights with the Google PageSpeed service on deploys through [grunt-pagespeed](https://github.com/jrcryer/grunt-pagespeed)
- Also available through `ec2_pagespeed:ip` (`ip` could also be a domain such as `example.com`)

# 0.4.2 People Skills

- When shutting down an instance, delete its name tag
- Run `sudo pm2 list` after deploys, to make sure we notice things like _a spike of process restarts_

# 0.4.1 Gray Goose

- Either use HTTP or HTTPS. _Never both_

# 0.4.0 Green Padlock

- Support added for HTTPS on `nginx`!
- Better configurability of what gets excluded and included by `rsync` during deployments.

**BREAKING**

- Changed `AWS_SECURITY_GROUP_NAME` to `AWS_SECURITY_GROUP`
- Changed `RSYNC_IGNORE` to `RSYNC_EXCLUDE_FROM`

# 0.3.1 Gold Meadow

- New task `ec2_version` to find out currently deployed app version
- New task `ec2_node_list` prints a list of `node` processes
- New task `ec2_node_monit` prints diagnostics information
- New task `ec2_node_reload` hot code reload with `pm2`
- New task `ec2_node_restart` restarts `pm2`
- New task `ec2_node_start` starts node through `pm2`
- New task `ec2_node_stop` stops `pm2`
- New task `ec2_nginx_reload` reloads `nginx` server
- New task `ec2_nginx_restart` restarts `nginx`
- New task `ec2_nginx_start` starts the `nginx` service
- New task `ec2_nginx_stop` stops the `nginx` service
- New task `ec2_logs_nginx_access` displays `nginx` access logs
- New task `ec2_logs_nginx_error` displays `nginx` error logs
- New task `ec2_logs_node` flushes `pm2` logs

# 0.3.0 Sofa Cushion

- Proxy `nginx` server in front of `Node`

# 0.2.9 Ice Age

- Persist port forwarding configuration through reboots

# 0.2.8 Elastic Band

- Sets `NODE_ENV` to the name of the EC2 instance
- Added `ec2_reboot:name` task
- Log HTTP url after deploys
- Fixed `pm2` start/reload command
- Peek at logs 5s after deploys using `pm2 flush`

# 0.2.7 Sun Bed

- Port forwarding from 80 to 8080
- Create and assign elastic IP address to instances
- Release assigned IP addresses on instance shutdown
- Keep only the last 10 versions, deletes older ones on deploys