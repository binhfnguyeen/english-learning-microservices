/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Enum.java to edit this template
 */
package com.heulwen.backendservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 *
 * @author Dell
 */
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(1001, "Invalid message key.", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be a least 3 characters.", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004, "Password must be a least 8 characters.", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission.", HttpStatus.FORBIDDEN),
    VOCAB_NOT_FOUND(1008, "Vocabulary not found.", HttpStatus.NOT_FOUND),
    TOPIC_NOT_FOUND(1009 , "Topic not found.", HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(1010 , "Question not found.", HttpStatus.NOT_FOUND),
    TEST_NOT_FOUND(1011 , "Test not found.", HttpStatus.NOT_FOUND),
    TEST_RESULTS_NOT_FOUND(1012, "Test results not found.", HttpStatus.NOT_FOUND),
    CONSERVATION_NOT_FOUND(1013 , "Conservation not found.", HttpStatus.NOT_FOUND),
    WORD_ALREADY_LEARNED(1014 , "Word already learned.", HttpStatus.CREATED),
    LEARNED_DATE_ALREADY_EXISTS(1015 , "Learned date already existed.", HttpStatus.CREATED),
    INVALID_OTP(1016, "Invalid otp.", HttpStatus.NOT_FOUND),
    OTP_EXPIRED(1017, "Otp expired", HttpStatus.FORBIDDEN),
    EXERCISE_NOT_FOUND(1018, "Exercise not found.", HttpStatus.NOT_FOUND),
    EXERCISE_ALREADY_EXISTS(1019, "Exercises already exists", HttpStatus.CREATED)
    ;
            
    private final int code;
    private final String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    /**
     * @return the code
     */
    public int getCode() {
        return code;
    }

    /**
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @return the statusCode
     */
    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
