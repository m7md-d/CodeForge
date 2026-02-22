FROM python:3.10-slim

# Set working directory to /app/backend so that `os.path.join(..., "..", "data")` precisely targets `/app/data`
WORKDIR /app/backend

# Install dependencies statically
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Inject the FastAPI codebase
COPY . .

# Expose API traffic port
EXPOSE 8000

# Mount standard Uvicorn worker
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
