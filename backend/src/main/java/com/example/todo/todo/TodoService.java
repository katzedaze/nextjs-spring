package com.example.todo.todo;

import com.example.todo.common.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TodoService {

  private final TodoRepository repository;

  public TodoService(TodoRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<Todo> list(UUID userId) {
    return repository.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public Todo create(UUID userId, TodoDtos.CreateRequest req) {
    Todo todo =
        Todo.builder()
            .userId(userId)
            .title(req.title())
            .description(req.description())
            .done(false)
            .dueDate(req.dueDate())
            .build();
    return repository.save(todo);
  }

  public Todo update(UUID userId, UUID id, TodoDtos.UpdateRequest req) {
    Todo existing =
        repository
            .findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Todo not found"));
    if (req.title() != null) existing.setTitle(req.title());
    if (req.description() != null) existing.setDescription(req.description());
    if (req.done() != null) existing.setDone(req.done());
    if (req.dueDate() != null) existing.setDueDate(req.dueDate());
    return repository.save(existing);
  }

  public void delete(UUID userId, UUID id) {
    Todo existing =
        repository
            .findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Todo not found"));
    repository.delete(existing);
  }
}
