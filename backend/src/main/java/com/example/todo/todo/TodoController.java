package com.example.todo.todo;

import com.example.todo.common.ApiResponse;
import com.example.todo.config.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

  private static final int DEFAULT_PAGE_SIZE = 50;
  private static final int MAX_PAGE_SIZE = 200;

  private final TodoService service;

  public TodoController(TodoService service) {
    this.service = service;
  }

  @GetMapping
  public ApiResponse<List<TodoDtos.TodoResponse>> list(
      @AuthenticationPrincipal AuthenticatedUser user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "" + DEFAULT_PAGE_SIZE) int size) {
    int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    int safePage = Math.max(page, 0);
    Pageable pageable =
        PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Todo> result = service.list(user.id(), pageable);
    List<TodoDtos.TodoResponse> items =
        result.getContent().stream().map(TodoDtos.TodoResponse::from).toList();
    return ApiResponse.ok(
        items, new ApiResponse.Meta(result.getTotalElements(), safePage, safeSize));
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
  public ResponseEntity<Void> delete(
      @AuthenticationPrincipal AuthenticatedUser user, @PathVariable UUID id) {
    service.delete(user.id(), id);
    return ResponseEntity.noContent().build();
  }
}
