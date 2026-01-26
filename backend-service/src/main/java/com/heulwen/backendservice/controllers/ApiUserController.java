/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.UserCreationRequest;
import com.heulwen.backendservice.dto.request.UserRequest;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.UserResponse;
import com.heulwen.backendservice.services.UserService;
import java.util.List;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiUserController {

    UserService userService;

    @PostMapping(path = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<UserResponse> createUser(@RequestParam Map<String, String> params, @RequestParam(value = "avatar") MultipartFile avatar) {
        UserCreationRequest request = UserCreationRequest.builder()
                .firstName(params.get("firstName"))
                .lastName(params.get("lastName"))
                .email(params.get("email"))
                .phone(params.get("phone"))
                .username(params.get("username"))
                .password(params.get("password"))
                .build();
        
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(this.userService.createUser(request, avatar))
                .build();
    }
    
        @PostMapping(path = "/secure/users/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<UserResponse> createAdmin(@RequestParam Map<String, String> params, @RequestParam(value = "avatar") MultipartFile avatar) {
        UserCreationRequest request = UserCreationRequest.builder()
                .firstName(params.get("firstName"))
                .lastName(params.get("lastName"))
                .email(params.get("email"))
                .phone(params.get("phone"))
                .username(params.get("username"))
                .password(params.get("password"))
                .build();
        
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(this.userService.createAdmin(request, avatar))
                .build();
    }
    
    @PostMapping(path = "/users/{userId}" ,consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable("userId") Integer userId,@RequestParam Map<String, String> params,  @RequestParam(value = "avatar", required = false) MultipartFile avatar){
        UserRequest request = UserRequest.builder()
                .email(params.get("email"))
                .phone(params.get("phone"))
                .firstName(params.get("firstName"))
                .lastName(params.get("lastName"))
                .build();
        
        userService.updateUser(userId, request, avatar);
        return ResponseEntity.ok("Cập nhật thông tin user thành công!");
    }

    @GetMapping("/secure/users")
    public ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(userService.getUsers())
                .build();
    }
    
    @GetMapping("/secure/users/admin")
    public ApiResponse<List<UserResponse>> getUsersAdmin() {
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .result(userService.getUsersAdmin("ADMIN"))
                .build();
    }
    
    @DeleteMapping("/secure/users/{userId}/admin")
    public ResponseEntity<?> deleteAdmin(@PathVariable("userId") Integer userId){
        userService.deleteAdmin(userId);
        return ResponseEntity.ok("Xóa tài khoản Quản trị viên thành công!");
    }
}
