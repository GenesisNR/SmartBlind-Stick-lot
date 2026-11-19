package cr.invenio.smart_blind_stick;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.util.HtmlUtils;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class LoginController {
    @GetMapping("/login")
    public ResponseEntity<String> login(HttpServletRequest request) throws IOException {
        var csrf = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        String page;
        try (var stream = new ClassPathResource("templates/login.html").getInputStream()) {
            page = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        page = page.replace("%%CSRF_NAME%%", HtmlUtils.htmlEscape(csrf.getParameterName()))
            .replace("%%CSRF_VALUE%%", HtmlUtils.htmlEscape(csrf.getToken()))
            .replace("%%ERROR_HIDDEN%%", request.getParameter("error") != null ? "" : "hidden")
            .replace("%%LOGOUT_HIDDEN%%", request.getParameter("logout") != null ? "" : "hidden");
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .contentType(new MediaType("text", "html", StandardCharsets.UTF_8)).body(page);
    }
}
