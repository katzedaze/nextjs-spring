package com.example.todo.common;

public class ConflictException extends RuntimeException {
  public ConflictException(String msg) {
    super(msg);
  }
}
