package com.heulwen.userservice.controller;

import com.heulwen.userservice.dto.ApiDto;
import com.heulwen.userservice.dto.UserDto;
import com.heulwen.userservice.form.UserCreateForm;
import com.heulwen.userservice.form.UserUpdateForm;
import com.heulwen.userservice.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    // --- CREATE USER ---
    @PostMapping(path = "/users",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiDto<UserDto> createUser(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        UserCreateForm form = new UserCreateForm();
        form.setUsername(username);
        form.setPassword(password);
        form.setFirstName(firstName);
        form.setLastName(lastName);
        form.setEmail(email);
        form.setPhone(phone);

        return ApiDto.<UserDto>builder()
                .code(1000)
                .result(userService.createUser(form, avatar))
                .build();
    }

    // --- CREATE ADMIN ---
    @PostMapping(path = "/secure/users/admin",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiDto<UserDto> createAdmin(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        UserCreateForm form = new UserCreateForm();
        form.setUsername(username);
        form.setPassword(password);
        form.setFirstName(firstName);
        form.setLastName(lastName);
        form.setEmail(email);
        form.setPhone(phone);

        return ApiDto.<UserDto>builder()
                .code(1000)
                .result(userService.createAdmin(form, avatar))
                .build();
    }

    // --- UPDATE USER ---
    @PostMapping(path = "/users/{userId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiDto<UserDto> updateUser(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        UserUpdateForm form = new UserUpdateForm();
        form.setFirstName(firstName);
        form.setLastName(lastName);
        form.setEmail(email);
        form.setPhone(phone);

        UserDto updatedUser = userService.updateUser(userId, form, avatar);

        return ApiDto.<UserDto>builder()
                .code(1000)
                .message("Cập nhật thông tin user thành công!")
                .result(updatedUser)
                .build();
    }

    // --- GET LIST USERS ---
    @GetMapping("/secure/users")
    public ApiDto<List<UserDto>> getUsers() {
        return ApiDto.<List<UserDto>>builder()
                .code(1000)
                .result(userService.getUsers())
                .build();
    }

    // --- GET LIST ADMINS ---
    @GetMapping("/secure/users/admin")
    public ApiDto<List<UserDto>> getUsersAdmin() {
        return ApiDto.<List<UserDto>>builder()
                .code(1000)
                .result(userService.getUsersAdmin("ADMIN"))
                .build();
    }

    // --- DELETE ADMIN ---
    @DeleteMapping("/secure/users/{userId}/admin")
    public ResponseEntity<?> deleteAdmin(@PathVariable("userId") Long userId) {
        userService.deleteAdmin(userId);
        return ResponseEntity.ok(Map.of("message", "Xóa tài khoản Quản trị viên thành công!"));
    }

    // --- GET USER BY ID ---
    @GetMapping("/users/{userId}")
    public ApiDto<UserDto> getUserById(@PathVariable("userId") Long userId) {
        return ApiDto.<UserDto>builder()
                .code(1000)
                .result(userService.getUserById(userId))
                .build();
    }
}
