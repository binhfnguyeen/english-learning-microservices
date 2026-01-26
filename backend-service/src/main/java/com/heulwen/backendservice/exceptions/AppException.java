/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.exceptions;

/**
 *
 * @author Dell
 */
public class AppException extends RuntimeException{
    private ErrorCode errorCode;

    public AppException(ErrorCode errorCode){
        this.errorCode = errorCode;
    }
    
    
    /**
     * @return the errorCode
     */
    public ErrorCode getErrorCode() {
        return errorCode;
    }

    /**
     * @param errorCode the errorCode to set
     */
    public void setErrorCode(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
}
