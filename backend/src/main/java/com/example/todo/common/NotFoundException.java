package com.example.todo.common;

public class NotFoundException extends RuntimeException {
  public NotFoundException(String msg) {
    super(msg);
  }
}
