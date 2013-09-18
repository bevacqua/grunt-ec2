# Deploying to Amazon Web Services

> You will need a decrypted `aws.json` configuration file.

For every task in this document, you'll need to set up the AWS configuration for the project. You'll also need to have a **Security Group** set up on AWS. Make sure to enable rules for inbound SSH (port 22) and HTTP (port 80) traffic.

The first time around, you'll [**need to get**](http://www.pip-installer.org/en/latest/installing.html) `pip` to be able to deploy. Then, this command will install the `awscli` command-line tools for AWS:

```shell
grunt deploy_setup
```

The `ec2_launch` command will create a key pair, launch a new EC2 instance, tag it with the name you provided, and install everything you need in it.

```shell
grunt ec2_launch:voodoo
```

If you don't even have staging and production environments up, you can spin them in one fell swoop.

```shell
grunt ec2_launch:staging ec2_launch:production
```

# Deploying

To deploy to an EC2 instance, use the convenience `grunt deploy` (for staging), and `grunt deploy_production` for production.
