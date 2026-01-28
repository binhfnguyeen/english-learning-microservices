FROM azul/zulu-openjdk:17

# Tạo thư mục ứng dụng trong container
WORKDIR /app

# Sao chép file jar vào thư mục làm việc trong container
COPY target/backend-service-0.0.1-SNAPSHOT.jar /app/backend-service-0.0.1-SNAPSHOT.jar

# Chạy ứng dụng khi container khởi động
ENTRYPOINT ["java", "-jar", "backend-service-0.0.1-SNAPSHOT.jar"]