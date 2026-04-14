package com.example.todo.todo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, UUID> {
  List<Todo> findByUserIdOrderByCreatedAtDesc(UUID userId);

  Optional<Todo> findByIdAndUserId(UUID id, UUID userId);
}
