FROM python:3

RUN apt-get update && \
    apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .



RUN curl -o src/models/resnet34.pth https://download.pytorch.org/models/resnet34-333f7ec4.pth
RUN pip3 install -r requirements.txt


EXPOSE 4000

CMD ["python3", "src/app.py"]
