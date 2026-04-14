package com.example.todo.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class TodoDtos {

  public record CreateRequest(
      @NotBlank @Size(max = 255) String title,
      @Size(max = 10000) String description,
      LocalDate dueDate) {}

  public record UpdateRequest(
      @Size(max = 255) String title,
      @Size(max = 10000) String description,
      Boolean done,
      LocalDate dueDate) {}

  public record TodoResponse(
      UUID id,
      String title,
      String description,
      boolean done,
      LocalDate dueDate,
      Instant createdAt,
      Instant updatedAt) {
    public static TodoResponse from(Todo t) {
      return new TodoResponse(
          t.getId(),
          t.getTitle(),
          t.getDescription(),
          t.isDone(),
          t.getDueDate(),
          t.getCreatedAt(),
          t.getUpdatedAt());
    }
  }
}
