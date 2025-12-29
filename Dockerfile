# Dockerfile for VidéoDownloader SaaS
# Uses Node.js and Python (yt-dlp)

FROM node:20-bullseye

# Install python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip
RUN python3 -m pip install --no-cache-dir yt-dlp

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching (if present)
COPY package*.json ./

# Install node dependencies (if package.json exists)
RUN if [ -f package.json ]; then npm ci --only=production || npm install --only=production; fi

# Copy application source
COPY . .

# Create downloads directory
RUN mkdir -p downloads

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
