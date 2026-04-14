package com.example.todo.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.lang.reflect.Field;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private JwtService jwtService;

  @BeforeEach
  void setUp() throws Exception {
    jwtService = new JwtService();
    setField("secret", "unit-test-secret-32-bytes-long-aaaaaaaaaaaaaa");
    setField("expirationMs", 60_000L);
    jwtService.init();
  }

  private void setField(String name, Object value) throws Exception {
    Field f = JwtService.class.getDeclaredField(name);
    f.setAccessible(true);
    f.set(jwtService, value);
  }

  @Test
  void issued_token_roundtrips_and_carries_claims() {
    UUID id = UUID.randomUUID();
    String token = jwtService.issue(id, "alice@example.com", "Alice");

    Claims claims = jwtService.parse(token);
    assertThat(claims.getSubject()).isEqualTo(id.toString());
    assertThat(claims.get("email", String.class)).isEqualTo("alice@example.com");
    assertThat(claims.get("displayName", String.class)).isEqualTo("Alice");
    assertThat(claims.getIssuer()).isEqualTo("todo-app");
    assertThat(claims.getAudience()).contains("todo-api");
  }

  @Test
  void parse_rejects_tampered_signature() {
    String token = jwtService.issue(UUID.randomUUID(), "a@b.com", "A");
    // flip a character in the signature segment
    String[] parts = token.split("\\.");
    String tampered =
        parts[0]
            + "."
            + parts[1]
            + "."
            + (parts[2].charAt(0) == 'A' ? 'B' : 'A')
            + parts[2].substring(1);

    assertThatThrownBy(() -> jwtService.parse(tampered)).isInstanceOf(JwtException.class);
  }

  @Test
  void init_rejects_short_secret() throws Exception {
    JwtService svc = new JwtService();
    Field f = JwtService.class.getDeclaredField("secret");
    f.setAccessible(true);
    f.set(svc, "too-short");
    assertThatThrownBy(svc::init).isInstanceOf(IllegalStateException.class);
  }
}
