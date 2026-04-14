package com.example.todo.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class AuthDtos {

  public record RegisterRequest(
      @Email @NotBlank String email,
      @NotBlank @Size(min = 8, max = 100) String password,
      @NotBlank @Size(max = 100) String displayName) {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record AuthResponse(String token, UserView user) {}

  public record UserView(UUID id, String email, String displayName) {}
}
