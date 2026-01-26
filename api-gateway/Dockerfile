FROM azul/zulu-openjdk:17

# Tạo thư mục ứng dụng trong container
WORKDIR /app

# Sao chép file jar vào thư mục làm việc trong container
COPY target/api-gateway-0.0.1-SNAPSHOT.jar /app/api-gateway-0.0.1-SNAPSHOT.jar

# Chạy ứng dụng khi container khởi động
ENTRYPOINT ["java", "-jar", "api-gateway-0.0.1-SNAPSHOT.jar"]