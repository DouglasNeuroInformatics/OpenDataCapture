FROM --platform=linux/amd64 ubuntu:18.04
RUN apt-get update
RUN apt-get install ca-certificates curl gnupg lsb-release -y

# Install Docker
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update
RUN apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Install Python
RUN apt-get install python3.7 -y

# Install Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs
RUN corepack enable

WORKDIR /app
RUN curl -LJO https://github.com/getredash/redash/archive/refs/tags/v10.1.0.tar.gz 
RUN tar -xvf redash-10.1.0.tar.gz

WORKDIR /app/redash-10.1.0
RUN echo REDASH_COOKIE_SECRET=$(python3.7 -c 'import secrets; print(secrets.token_hex())') > .env
