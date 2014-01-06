# 0.7.2 Grunt Basics

- Revert from Grunt `@0.4.2` to using `@0.4.1`

# 0.7.1 Overly Dependant Package

- Update dependencies to edge versions
- Use `~` in dependency versions

# 0.7.0 Rooster Tornado

- Differentiate logging from AWS API requests (`aws`) and commands executed (`cmd`)

Fixes

- Fixed issues in `ec2_elb_attach` and `ec2_elb_detach` tasks

**BREAKING**

- Stopped using `aws-cli` in favor of the native `aws-sdk` API
- Installing `pip` and `aws-cli` isn't necessary anymore

# 0.6.3 Quicksand

Fixes

- Fixed issue with remote `rsync` path resolving to something ending with `//*`, causing various issues.

# 0.6.2 Broken Windows

Fixes

- Local `rsync` path is now `.`, rather than `process.cwd()`, helping fix an issue on Windows.

# 0.6.1 Hot Sauce

Fixes

- Typing <kbd>ctrl</kbd>+<kbd>c</kbd> once kills the active command in the remote `ssh` session. Typing <kbd>ctrl</kbd>+<kbd>c</kbd> again ends the task
- Fixed issues when typing `exit` into the `ssh` interactive session

# 0.6.0 Super Sweet Hacker

Known Issues

- Terminating commands with a `SIGINT` signal (typing <kbd>ctrl</kbd>+<kbd>c</kbd>) over `ssh` using the interactive `ec2_ssh` task is unsupported at the moment: You have to leave the session in order to terminate the program. _This is being addressed._

Fixes

- Proper `ssh` session termination

**BREAKING**

- `ec2_ssh` renamed as `ec2_ssh_text`
- `ec2_ssh` is a new command that enables interactive `ssh` on the instance, saving you the step to copy and paste the command

# 0.5.0 Spring Cleaning

- `ec2_elb_attach:name:elb?` attaches an instance to an ELB
- `ec2_elb_detach:name:elb?` detaches an instance from an ELB
- ELB is optional, if not found, default value `"AWS_ELB_NAME"` is used
- `ec2_assign_existing_address:id:ip` assigns an IP address to an instance without allocating a new one
- `"NPM_INSTALL_DISABLED"` option won't `npm install --production` after deploys if `true`
- `"NPM_REBUILD"` option will `npm rebuild` after deploys if `true`

Fixes

- Pass cygwin-style local paths to `rsync` on Windows

**BREAKING**

- `ec2_list` now lists instances in one liners containing important information
- `ec2_lookup` now lists instances in one liners containing important information
- Previous `ec2_list` functionality renamed as `ec2_list_json`
- Previous `ec2_lookup` functionality renamed as `ec2_list_json`

# 0.4.6 English Teacher

- Added description to all Grunt tasks exposed by `grunt-ec2`
- Little prefix to differentiate commands run locally from those run over ssh

# 0.4.5 Engine X

- Separated `nginx` configuration into independant task
- Verbose logging on some code paths (using `--verbose`)
- `nginx` now minifying favicons, just run `ec2_nginx_configure:something` to update

# 0.4.4 Sam Black

- `rsync` uses a larger buffer than regular commands we `exec`
- `rsync` verbosity can be set with the `VERBOSITY_RSYNC` option
- `npm` verbosity can be set with the `VERBOSITY_NPM` option
- Fixed bug when defaulting to use the `defaults.rsyncignore` file
- Elastic IP assignment is now _optional_, but enabled by default
- Ability to provide `ENV` option which is passed to `pm2` as environment variables

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
