package cr.invenio.smart_blind_stick.model;

public class SensorData {

    private double distance;
    private boolean obstacleDetected;

    public SensorData() {
    }

    public SensorData(double distance, boolean obstacleDetected) {
        this.distance = distance;
        this.obstacleDetected = obstacleDetected;
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
}
