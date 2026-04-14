package com.example.todo.todo;

import com.example.todo.common.ApiResponse;
import com.example.todo.config.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

  private final TodoService service;

  public TodoController(TodoService service) {
    this.service = service;
  }

  @GetMapping
  public ApiResponse<List<TodoDtos.TodoResponse>> list(
      @AuthenticationPrincipal AuthenticatedUser user) {
    List<TodoDtos.TodoResponse> items =
        service.list(user.id()).stream().map(TodoDtos.TodoResponse::from).toList();
    return ApiResponse.ok(items);
  }

  @PostMapping
  public ResponseEntity<ApiResponse<TodoDtos.TodoResponse>> create(
      @AuthenticationPrincipal AuthenticatedUser user,
      @Valid @RequestBody TodoDtos.CreateRequest req) {
    Todo created = service.create(user.id(), req);
    return ResponseEntity.status(201).body(ApiResponse.ok(TodoDtos.TodoResponse.from(created)));
  }

  @PatchMapping("/{id}")
  public ApiResponse<TodoDtos.TodoResponse> update(
      @AuthenticationPrincipal AuthenticatedUser user,
      @PathVariable UUID id,
      @Valid @RequestBody TodoDtos.UpdateRequest req) {
    Todo updated = service.update(user.id(), id, req);
    return ApiResponse.ok(TodoDtos.TodoResponse.from(updated));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(
      @AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID id) {
    service.delete(user.id(), id);
    return ApiResponse.ok(null);
  }
}
