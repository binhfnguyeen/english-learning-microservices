package com.heulwen.backendservice.form;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserCreateForm {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String username;
    private String password;
    private String role;
    private MultipartFile avatarFile;
}
