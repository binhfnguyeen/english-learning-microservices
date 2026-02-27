package com.heulwen.backendservice.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception.", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(1001, "Invalid message key.", HttpStatus.BAD_REQUEST),
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
    EXERCISE_NOT_FOUND(1018, "Exercise not found.", HttpStatus.NOT_FOUND),
    EXERCISE_ALREADY_EXISTS(1019, "Exercises already exists", HttpStatus.CREATED),
    CHOICE_NOT_FOUND(1020, "Choice not found.", HttpStatus.NOT_FOUND),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
