# bledebug

Simple BLE service to send notifications via a Unix Domain Socket for debugging purposes.

## Installation

NodeJS and npm are required to use *bledebug*.
For dependencies just execute `npm install` and you are ready to go.

Type `node bledebug.js` to start announcing the service. Depending on your setup `sudo` might be needed for execution. Further information regarding BLE setup on linux can be found on the bleno project website (https://github.com/noble/bleno).

## Usage

Any message sent to the unix domain socket (`/tmp/ble.sock`) is published via a BLE notify message. 

To send a message from any shellscript use `client/bleecho.py`.

Example for publishing the current date and afterwards greeting the world:
```
$ python bleecho.py $(date)
connecting to /tmp/ble.sock
Sending 'Fri Mar 23 12:59:26 UTC 2018'

$ python bleecho.py "hello world"
connecting to /tmp/ble.sock
Sending 'hello world'

$ python bleecho.py hello world
connecting to /tmp/ble.sock
Sending 'hello world'

```


**Keep in mind the length restrictions of BLE notifications!**

## Advanced usage

**SECURITY RISK:** There are also hooks to react on BLE write requests in the `bledebug.js` file. Since the service is usually running as root and there is no special protection for the BLE service, this can easily lead to a system compromise! 
