package com.example.todo.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.todo.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class AuthFlowIT extends AbstractIntegrationTest {

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;

  @Test
  void register_then_login_returns_token() throws Exception {
    String email = "alice+" + System.nanoTime() + "@example.com";
    String body =
        mapper.writeValueAsString(
            Map.of(
                "email", email,
                "password", "password123",
                "displayName", "Alice"));
    mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.token").isNotEmpty());

    String login = mapper.writeValueAsString(Map.of("email", email, "password", "password123"));
    mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.token").isNotEmpty());
  }

  @Test
  void login_with_wrong_password_returns_401() throws Exception {
    String email = "bob+" + System.nanoTime() + "@example.com";
    mvc.perform(
        post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(
                mapper.writeValueAsString(
                    Map.of("email", email, "password", "password123", "displayName", "Bob"))));

    mvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    mapper.writeValueAsString(Map.of("email", email, "password", "wrong-pass"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void unauthenticated_todos_returns_401() throws Exception {
    mvc.perform(get("/api/todos")).andExpect(status().isUnauthorized());
  }
}
