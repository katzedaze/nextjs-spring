package com.example.todo.auth;

import com.example.todo.common.ApiResponse;
import com.example.todo.config.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> register(
      @Valid @RequestBody AuthDtos.RegisterRequest req) {
    return ResponseEntity.status(201).body(ApiResponse.ok(authService.register(req)));
  }

  @PostMapping("/login")
  public ApiResponse<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
    return ApiResponse.ok(authService.login(req));
  }

  @GetMapping("/me")
  public ApiResponse<AuthDtos.UserView> me(@AuthenticationPrincipal AuthenticatedUser user) {
    return ApiResponse.ok(new AuthDtos.UserView(user.id(), user.email(), user.displayName()));
  }
}
