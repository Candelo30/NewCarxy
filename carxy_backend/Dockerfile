# Usa la imagen oficial de Python
FROM python:3.9

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el contenido del directorio actual (el proyecto)
COPY . .

# Exponer el puerto que utilizará la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["gunicorn", "carxy.wsgi:application", "--bind", "0.0.0.0:8000"]
