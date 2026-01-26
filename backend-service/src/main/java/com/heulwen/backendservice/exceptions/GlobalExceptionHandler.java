/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.exceptions;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 *
 * @author Dell
 */
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleException(AppException ex){
         ErrorCode code = ex.getErrorCode();

        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("code", code.getCode());
        errorBody.put("message", code.getMessage());
        errorBody.put("status", code.getStatusCode().value());
        errorBody.put("timestamp", ZonedDateTime.now());

        return ResponseEntity
                .status(code.getStatusCode())
                .body(errorBody);
    }
}
