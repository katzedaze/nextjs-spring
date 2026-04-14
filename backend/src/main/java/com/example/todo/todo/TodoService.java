package com.example.todo.todo;

import com.example.todo.common.NotFoundException;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TodoService {

  private final TodoRepository repository;

  public TodoService(TodoRepository repository) {
    this.repository = repository;
  }

  public Page<Todo> list(UUID userId, Pageable pageable) {
    return repository.findByUserId(userId, pageable);
  }

  @Transactional
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

  @Transactional
  public Todo update(UUID userId, UUID id, TodoDtos.UpdateRequest req) {
    Todo existing =
        repository
            .findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Todo not found"));
    if (req.title() != null) existing.setTitle(req.title());
    if (Boolean.TRUE.equals(req.clearDescription())) {
      existing.setDescription(null);
    } else if (req.description() != null) {
      existing.setDescription(req.description());
    }
    if (req.done() != null) existing.setDone(req.done());
    if (Boolean.TRUE.equals(req.clearDueDate())) {
      existing.setDueDate(null);
    } else if (req.dueDate() != null) {
      existing.setDueDate(req.dueDate());
    }
    return repository.save(existing);
  }

  @Transactional
  public void delete(UUID userId, UUID id) {
    Todo existing =
        repository
            .findByIdAndUserId(id, userId)
            .orElseThrow(() -> new NotFoundException("Todo not found"));
    repository.delete(existing);
  }
}
