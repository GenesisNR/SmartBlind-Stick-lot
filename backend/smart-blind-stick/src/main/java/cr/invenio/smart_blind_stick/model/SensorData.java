package cr.invenio.smart_blind_stick.model;

@jakarta.persistence.Entity
public class SensorData {
    @jakarta.persistence.Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private java.time.Instant receivedAt;

    public Long getId() { return id; }
    public java.time.Instant getReceivedAt() { return receivedAt; }
    @jakarta.persistence.PrePersist
    void timestamp() { receivedAt = java.time.Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS); }


    private double distance;
    private boolean obstacleDetected;
    private double latitude;
    private double longitude;

    public SensorData() {
    }

    public SensorData(double distance, boolean obstacleDetected, double latitude, double longitude) {
        this.distance = distance;
        this.obstacleDetected = obstacleDetected;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public boolean isObstacleDetected() {
        return obstacleDetected;
    }

    public void setObstacleDetected(boolean obstacleDetected) {
        this.obstacleDetected = obstacleDetected;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
