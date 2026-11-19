package cr.invenio.smart_blind_stick.controller;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import cr.invenio.smart_blind_stick.model.*;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {
    private final SensorRepository repository;
    public SensorController(SensorRepository repository) { this.repository = repository; }
    @PostMapping
    public SensorData receiveData(@RequestBody SensorData data) {
        if (!Double.isFinite(data.getDistance()) || data.getDistance() < 0
                || !Double.isFinite(data.getLatitude()) || Math.abs(data.getLatitude()) > 90
                || !Double.isFinite(data.getLongitude()) || Math.abs(data.getLongitude()) > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        // Ignore client-supplied IDs and timestamps: always append a server-stamped reading.
        return repository.save(new SensorData(data.getDistance(), data.isObstacleDetected(),
                data.getLatitude(), data.getLongitude()));
    }
    @GetMapping("/last")
    public ResponseEntity<SensorData> getLastData() {
        return repository.findFirstByOrderByIdDesc().map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
    @GetMapping("/history")
    public List<SensorData> getHistory() {
        List<SensorData> result = new ArrayList<>(repository.findTop100ByOrderByIdDesc());
        Collections.reverse(result);
        return result;
    }
}
