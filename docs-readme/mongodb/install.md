
## Attempt 1

### Install

- sudo apt-get update
- sudo apt-get install mongodb

### Check everything works

- sudo service mongodb status

● mongodb.service - An object/document-oriented database
   Loaded: loaded (/lib/systemd/system/mongodb.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Fri 2018-02-16 12:12:22 EST; 33s ago
     Docs: man:mongod(1)
 Main PID: 8266 (code=exited, status=100)

Feb 16 12:12:21 johnsz-VirtualBox systemd[1]: Started An object/document-oriented database.
Feb 16 12:12:22 johnsz-VirtualBox systemd[1]: mongodb.service: Main process exited, code=exited, status=100/n/a
Feb 16 12:12:22 johnsz-VirtualBox systemd[1]: mongodb.service: Unit entered failed state.
Feb 16 12:12:22 johnsz-VirtualBox systemd[1]: mongodb.service: Failed with result 'exit-code'.

## Attempt 2

https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04

- sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
- sudo apt-get update
- sudo apt-get install -y mongodb-org
- sudo systemctl start mongod

## Attempt 3

https://www.howtoforge.com/tutorial/install-mongodb-on-ubuntu-16.04/

- sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
- echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
- sudo apt-get update
- sudo apt-get install -y mongodb-org
- cd /lib/systemd/system/
- sudo vim mongod.service

to avoid:
"mongod.service"
"mongod.service" E212: Can't open file for writing
Press ENTER or type command to continue

- systemctl daemon-reload
- systemctl start mongod
- systemctl enable mongod
- netstat -plntu

(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      -               
tcp        0      0 0.0.0.0:445             0.0.0.0:*               LISTEN      -               
tcp        0      0 127.0.0.1:27017         0.0.0.0:*               LISTEN      -  

- mongo
- use admin
- exit

- skipped create the root uiser
- skipped enable mongodb authentication

- sudo service mongod restart


### https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

- sudo service mongod start
- sudo service mongod stop
- sudo service mongod restart
