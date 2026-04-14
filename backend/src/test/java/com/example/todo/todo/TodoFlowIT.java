package com.example.todo.todo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.example.todo.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class TodoFlowIT extends AbstractIntegrationTest {

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;

  private String registerAndGetToken(String email) throws Exception {
    String body =
        mapper.writeValueAsString(
            Map.of("email", email, "password", "password123", "displayName", "User"));
    String resp =
        mvc.perform(
                post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
            .andReturn()
            .getResponse()
            .getContentAsString();
    return mapper.readTree(resp).path("data").path("token").asText();
  }

  @Test
  void full_todo_crud_flow() throws Exception {
    String token = registerAndGetToken("todo+" + System.nanoTime() + "@example.com");
    String auth = "Bearer " + token;

    String create = mapper.writeValueAsString(Map.of("title", "Buy milk"));
    String created =
        mvc.perform(
                post("/api/todos")
                    .header("Authorization", auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(create))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.title").value("Buy milk"))
            .andExpect(jsonPath("$.data.done").value(false))
            .andReturn()
            .getResponse()
            .getContentAsString();
    JsonNode createdNode = mapper.readTree(created);
    String id = createdNode.path("data").path("id").asText();

    mvc.perform(get("/api/todos").header("Authorization", auth))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.length()").value(1));

    String patch = mapper.writeValueAsString(Map.of("done", true));
    mvc.perform(
            patch("/api/todos/" + id)
                .header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content(patch))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.done").value(true));

    mvc.perform(delete("/api/todos/" + id).header("Authorization", auth))
        .andExpect(status().isOk());

    mvc.perform(get("/api/todos").header("Authorization", auth))
        .andExpect(jsonPath("$.data.length()").value(0));
  }

  @Test
  void user_cannot_access_other_user_todo() throws Exception {
    String aliceToken = registerAndGetToken("alice+" + System.nanoTime() + "@example.com");
    String bobToken = registerAndGetToken("bob+" + System.nanoTime() + "@example.com");

    String created =
        mvc.perform(
                post("/api/todos")
                    .header("Authorization", "Bearer " + aliceToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(Map.of("title", "Alice private"))))
            .andReturn()
            .getResponse()
            .getContentAsString();
    String id = mapper.readTree(created).path("data").path("id").asText();

    mvc.perform(delete("/api/todos/" + id).header("Authorization", "Bearer " + bobToken))
        .andExpect(status().isNotFound());
  }
}
