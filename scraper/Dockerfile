# Dockerfile per Flask API + Selenium Scraper
FROM python:3.11-slim

# Installa dipendenze di sistema per Chrome e Selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Installa Google Chrome (metodo moderno senza apt-key)
RUN wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get update \
    && apt-get install -y /tmp/google-chrome.deb \
    && rm /tmp/google-chrome.deb \
    && rm -rf /var/lib/apt/lists/*

# Installa ChromeDriver (nuovo metodo - Chrome for Testing)
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}' | cut -d '.' -f 1) \
    && echo "Chrome version: $CHROME_VERSION" \
    && wget -q "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_VERSION}" -O /tmp/chromedriver_version \
    && CHROMEDRIVER_VERSION=$(cat /tmp/chromedriver_version) \
    && echo "ChromeDriver version: $CHROMEDRIVER_VERSION" \
    && wget -q "https://storage.googleapis.com/chrome-for-testing-public/${CHROMEDRIVER_VERSION}/linux64/chromedriver-linux64.zip" -O /tmp/chromedriver.zip \
    && unzip /tmp/chromedriver.zip -d /tmp/ \
    && mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/ \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64 /tmp/chromedriver_version

# Crea directory di lavoro
WORKDIR /app

# Copia requirements
COPY scraper/requirements.txt ./

# Installa dipendenze Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia codice scraper
COPY scraper/ ./

# Espone porta Flask
EXPOSE 5001

# Variabili d'ambiente
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

# Comando di avvio
CMD ["python", "api.py"]
