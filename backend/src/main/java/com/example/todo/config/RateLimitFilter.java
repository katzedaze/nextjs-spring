package com.example.todo.config;

import com.example.todo.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Per-IP in-memory rate limiter for the auth endpoints.
 *
 * <p>Token-bucket (10 requests / minute) per remote IP. Sufficient for a single-node deployment;
 * swap for a distributed store (Redis) for multi-node scale. Wired into the security filter chain
 * in {@link SecurityConfig} so it is not registered as a servlet filter twice.
 */
public class RateLimitFilter extends OncePerRequestFilter {

  private static final Set<String> THROTTLED_PATHS =
      Set.of("/api/auth/login", "/api/auth/register");
  private static final Bandwidth LIMIT =
      Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofMinutes(1)).build();

  private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();
  private final ObjectMapper mapper = new ObjectMapper();

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain chain)
      throws ServletException, IOException {

    if (!HttpMethod.POST.matches(request.getMethod())
        || !THROTTLED_PATHS.contains(request.getRequestURI())) {
      chain.doFilter(request, response);
      return;
    }

    Bucket bucket =
        buckets.computeIfAbsent(clientIp(request), ip -> Bucket.builder().addLimit(LIMIT).build());
    ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
    if (!probe.isConsumed()) {
      long retryAfterSeconds = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000L);
      response.setStatus(429);
      response.setHeader("Retry-After", Long.toString(retryAfterSeconds));
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      mapper.writeValue(
          response.getOutputStream(),
          ApiResponse.fail("Too many requests. Retry after " + retryAfterSeconds + "s"));
      return;
    }
    chain.doFilter(request, response);
  }

  private static String clientIp(HttpServletRequest request) {
    String xff = request.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      int comma = xff.indexOf(',');
      return (comma > 0 ? xff.substring(0, comma) : xff).trim();
    }
    return request.getRemoteAddr();
  }
}
