package cr.invenio.smart_blind_stick;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/health")
    public String home() {
        return "Smart Blind Stick Backend is running 🚀";
    }
}
