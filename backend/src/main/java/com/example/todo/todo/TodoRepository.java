package com.example.todo.todo;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, UUID> {
  Page<Todo> findByUserId(UUID userId, Pageable pageable);

  Optional<Todo> findByIdAndUserId(UUID id, UUID userId);
}
