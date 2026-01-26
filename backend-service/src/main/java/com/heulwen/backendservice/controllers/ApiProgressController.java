/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.ProgressOverviewResponse;
import com.heulwen.backendservice.dto.response.ProgressResponse;
import com.heulwen.backendservice.services.ProgressService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiProgressController {
    
    ProgressService progressService;
    
    @GetMapping("/progress/{userId}/overview")
    public ApiResponse<ProgressOverviewResponse> getUserProgress(@PathVariable("userId") int userId){
        return ApiResponse.<ProgressOverviewResponse>builder()
                .code(1000)
                .result(this.progressService.getProgressOverview(userId))
                .build();
    }
    
    @PostMapping("/progress/{userId}/date-learned")
    public ApiResponse<ProgressResponse> updateUserLearnedDay(@PathVariable("userId") int userId){
        return ApiResponse.<ProgressResponse>builder()
                .code(1000)
                .result(this.progressService.updateUserLearnedDay(userId))
                .build();
    }
    
}
