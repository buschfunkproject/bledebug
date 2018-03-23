import socket
import sys

if len(sys.argv) < 2:
    print("USAGE: %s <message to publish" % (sys.argv[0]))
    sys.exit(1)

sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

server_address = '/tmp/ble.sock'
print >>sys.stderr, 'connecting to %s' % server_address
try:
    sock.connect(server_address)
except socket.error, msg:
    print >>sys.stderr, msg
    sys.exit(1)

msg = " ".join(sys.argv[1:])
print("Sending '%s'" % msg)
sock.sendall(msg)
sock.close()