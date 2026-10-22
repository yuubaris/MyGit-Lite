#!/bin/sh
set -eu

# 幂等：首次创建目录、数据库和令牌；已有数据不会覆盖。
python manage.py init

exec "$@"
