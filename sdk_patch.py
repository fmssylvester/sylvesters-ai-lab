# Forces urllib3 to open a fresh TLS connection for every request.
# Works around proxy/TLS "INVALID_SESSION_ID / BAD_RECORD_MAC / RECORD_LAYER_FAILURE"
# errors that occur when the SDK reuses pooled keep-alive connections.
import urllib3
from urllib3.connectionpool import HTTPConnectionPool, HTTPSConnectionPool

_orig_new = HTTPConnectionPool._new_conn

def _new_conn_force_close(self):
    conn = _orig_new(self)
    try:
        conn.keep_alive = False
    except Exception:
        pass
    return conn

HTTPConnectionPool._new_conn = _new_conn_force_close
HTTPSConnectionPool._new_conn = _new_conn_force_close
