package com.example.todo.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, T data, String error, Meta meta) {
  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(true, data, null, null);
  }

  public static <T> ApiResponse<T> ok(T data, Meta meta) {
    return new ApiResponse<>(true, data, null, meta);
  }

  public static <T> ApiResponse<T> fail(String error) {
    return new ApiResponse<>(false, null, error, null);
  }

  public record Meta(long total, int page, int size) {}
}
