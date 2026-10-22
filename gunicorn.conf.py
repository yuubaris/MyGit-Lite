import os

bind = os.environ.get("MYGIT_BIND", "0.0.0.0:8443")
workers = int(os.environ.get("MYGIT_WORKERS", "1"))
worker_class = "gthread"
threads = int(os.environ.get("MYGIT_THREADS", "4"))
timeout = 120

accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("MYGIT_LOG_LEVEL", "info")
