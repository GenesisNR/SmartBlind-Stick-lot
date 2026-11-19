FROM maven:3.9.12-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B verify

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN groupadd --system smartblind && useradd --system --gid smartblind smartblind     && mkdir /app/data && chown -R smartblind:smartblind /app
COPY --from=build /app/target/smart-blind-stick-0.0.1-SNAPSHOT.jar /app/app.jar
USER smartblind
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70.0", "-jar", "/app/app.jar"]
