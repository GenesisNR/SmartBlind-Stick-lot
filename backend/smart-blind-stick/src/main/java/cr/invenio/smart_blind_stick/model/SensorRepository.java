package cr.invenio.smart_blind_stick.model;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SensorRepository extends JpaRepository<SensorData, Long> {
    Optional<SensorData> findFirstByOrderByIdDesc();
    List<SensorData> findTop100ByOrderByIdDesc();
}
