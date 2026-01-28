package com.heulwen.userservice.form;

import lombok.Data;

@Data
public class UserCreateForm {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String username;
    private String password;
    private String role;
    private String avatar;
}
