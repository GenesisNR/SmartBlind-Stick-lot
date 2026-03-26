package cr.invenio.smart_blind_stick.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cr.invenio.smart_blind_stick.model.SensorData;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {

    private SensorData lastData = new SensorData(0.0, false);
    private final List<SensorData> history = new ArrayList<>();

    // POST: recibe datos del sensor
    @PostMapping
    public SensorData receiveData(@RequestBody SensorData data) {
        this.lastData = data;
        history.add(data);
        return this.lastData;
    }

    // GET: devuelve el último dato recibido
    @GetMapping("/last")
    public SensorData getLastData() {
        return lastData;
    }
    
    @GetMapping("/history")
    public List<SensorData> getHistory() {
        return history;
    }





}