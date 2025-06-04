## How to run server

# Defaut

```bash
$ 1. python -m venv .venv
$ 2. .venv\Scripts\activate
$ 3. pip install -r requirements.txt
$ 4. fastapi run main.py
```

# Development

```bash
$ 1. python -m venv .venv
$ 2. .venv\Scripts\activate
$ 3. pip install -r requirements.txt
$ 4. fastapi dev main.py || uvicorn app.main:get_application
```

# Debug

````bash
$ $env:PYTHONPATH = (Get-Location).Path
$ run debug

```bash
$ start command on deploy: gunicorn -k uvicorn.workers.UvicornWorker app.main:app
````
