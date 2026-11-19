package cr.invenio.smart_blind_stick;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    UserDetailsService users(@Value("${DASHBOARD_PASSWORD}") String viewerPassword,
            @Value("${DEVICE_PASSWORD}") String devicePassword) {
        if (viewerPassword.length() < 16 || devicePassword.length() < 16
                || viewerPassword.equals(devicePassword)) {
            throw new IllegalArgumentException("Use two different passwords of at least 16 characters in DASHBOARD_PASSWORD and DEVICE_PASSWORD.");
        }
        var encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        return new InMemoryUserDetailsManager(
            User.withUsername("cuidador").password(encoder.encode(viewerPassword)).roles("VIEWER").build(),
            User.withUsername("baston").password(encoder.encode(devicePassword)).roles("DEVICE").build());
    }
    @Bean @Order(1)
    SecurityFilterChain deviceApi(HttpSecurity http) throws Exception {
        // Only the ingestion URL uses Basic credentials; browser sessions cannot send readings.
        return http.securityMatcher("/api/sensor")
            .authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.POST, "/api/sensor").hasRole("DEVICE")
                .anyRequest().denyAll())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable())
            .httpBasic(Customizer.withDefaults()).build();
    }
    @Bean @Order(2)
    SecurityFilterChain dashboard(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/error", "/manifest.webmanifest", "/sw.js", "/offline.html", "/icons/**",
                    "/dashboard.css", "/theme.js", "/login.css", "/login.js").permitAll()
                .anyRequest().hasRole("VIEWER"))
            .formLogin(login -> login.loginPage("/login").loginProcessingUrl("/login")
                .defaultSuccessUrl("/", true).failureUrl("/login?error").permitAll())
            .logout(logout -> logout.logoutSuccessUrl("/login?logout")).build();
    }
}
