# 0.2.8 Elastic Band

- Sets `NODE_ENV` to the name of the EC2 instance
- Added `ec2_reboot:name` task
- Log HTTP url after deploys
- Fixed `pm2` start/reload command
- Peek at logs 5s after deploys

# 0.2.7 Sun Bed

- Port forwarding from 80 to 8080
- Create and assign elastic IP address to instances
- Release assigned IP addresses on instance shutdown
- Keep only the last 10 versions, deletes older ones on deploys