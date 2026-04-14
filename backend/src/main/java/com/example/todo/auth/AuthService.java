package com.example.todo.auth;

import com.example.todo.common.ConflictException;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
    if (userRepository.existsByEmail(req.email())) {
      throw new ConflictException("Email already registered");
    }
    User user =
        User.builder()
            .email(req.email())
            .passwordHash(passwordEncoder.encode(req.password()))
            .displayName(req.displayName())
            .build();
    User saved = userRepository.save(user);
    String token = jwtService.issue(saved.getId(), saved.getEmail());
    return new AuthDtos.AuthResponse(
        token, new AuthDtos.UserView(saved.getId(), saved.getEmail(), saved.getDisplayName()));
  }

  @Transactional(readOnly = true)
  public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
    User user =
        userRepository
            .findByEmail(req.email())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      throw new BadCredentialsException("Invalid credentials");
    }
    String token = jwtService.issue(user.getId(), user.getEmail());
    return new AuthDtos.AuthResponse(
        token, new AuthDtos.UserView(user.getId(), user.getEmail(), user.getDisplayName()));
  }
}
