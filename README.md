Rigsketball
===========

The annual Rigsketball bracket site.

Editing
=======

Open up a few terminal tabs, run `grunt browserify` in one, and `node server` in another. Client side scripts will automatically reload, server needs to be restarted when changed.

If editing the admin app, run `grunt admin` in another tab to reload the admin client.

Deploying
=========

Add a file called `production` to the `ansible` directory. This is an ansible inventory file, and should include sections for `app`, `loadbalancer`, and `mongodb`:

example:
```
[app]
127.0.0.1 ansible_ssh_user=root

[loadbalancer]
127.0.0.1 ansible_ssh_user=root

[mongodb]
127.0.0.1 ansible_ssh_user=root

```

Add a file called `env.j2` to the `ansible/templates` folder, that defines environment variables for running the production app.

Example with all available vars:
```
# local app port. Nginx will run the app on port 3000 on the servers, this port is used by nginx for the local proxy, and should not be changed.
APP_PORT=4444
# local app IP. This should be 127.0.0.1 for nginx to find the app, and should not be changed.
APP_IP=127.0.0.1
# auth user/pass for basic authentication on the /api endpoints.
AUTH_USER=authuser
AUTH_PASSWORD=authpass
# node environment. this should always be "production".
NODE_ENV=production
# the name of the database
DB_NAME=rigsketball
# database host. Currently only supports a single host, the following expression will read it from your inventory file.
{% for host in groups['mongodb'] %}
DB_HOST={{host}}
{% endfor %}
# database port. Unless you've modified the mongodb config, this will be 27017
DB_PORT=27017
# number of workers to run in the node cluster. Should be the # of cpus on the FE server, but no less than 2 (for continuous deployment).
WORKER_COUNT=2
# tumblr key/secret for showing the blog
TUMBLR_KEY=somekey
TUMBLR_SECRET=somesecret
# subdomain to point the blog to
TUMBLR_SUBDOMAIN=rigsketball
```

To provision the inventory, run `./provision` from the root of this repo after creating the above files.

To deploy after provisioning, run `./deploy` from the root of this repo after running the provision script.
