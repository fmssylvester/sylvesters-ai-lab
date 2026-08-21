"""Minimal HTTP CONNECT proxy for Termux.

cloudflared (pure-Go) cannot resolve DNS on Termux (no /etc/resolv.conf, port 53
privileged). This proxy resolves via the system getaddrinfo() which DOES work on
Android (that's why curl works), and forwards TCP via CONNECT. cloudflared is
pointed at this proxy with HTTPS_PROXY.
"""
import socket
import threading

LISTEN = ("127.0.0.1", 8899)


def _copy(src, dst):
    try:
        while True:
            buf = src.recv(65536)
            if not buf:
                break
            dst.sendall(buf)
    except Exception:
        pass
    finally:
        for s in (src, dst):
            try:
                s.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass
            try:
                s.close()
            except Exception:
                pass


def _handle(conn):
    try:
        conn.settimeout(20)
        head = b""
        while b"\r\n\r\n" not in head and len(head) < 65536:
            head += conn.recv(4096)
        req_line = head.split(b"\r\n")[0].decode(errors="ignore")
        parts = req_line.split()
        if not parts or parts[0].upper() != "CONNECT":
            conn.sendall(b"HTTP/1.1 405 Method Not Allowed\r\n\r\n")
            return
        target = parts[1]
        host, port = target.rsplit(":", 1)
        port = int(port)
        host = host.strip("[]")
        remote = socket.create_connection((host, port), timeout=20)
        conn.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")
        t1 = threading.Thread(target=_copy, args=(conn, remote), daemon=True)
        t2 = threading.Thread(target=_copy, args=(remote, conn), daemon=True)
        t1.start()
        t2.start()
        t1.join()
        t2.join()
    except Exception:
        try:
            conn.sendall(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
        except Exception:
            pass
    finally:
        try:
            conn.close()
        except Exception:
            pass


def main():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(LISTEN)
    srv.listen(128)
    print(f"CONNECT proxy on {LISTEN[0]}:{LISTEN[1]}", flush=True)
    while True:
        try:
            conn, _ = srv.accept()
        except Exception:
            continue
        threading.Thread(target=_handle, args=(conn,), daemon=True).start()


if __name__ == "__main__":
    main()
