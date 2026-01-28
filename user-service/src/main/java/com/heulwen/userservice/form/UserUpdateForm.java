package com.heulwen.userservice.form;

import lombok.Data;

@Data
public class UserUpdateForm {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Boolean isActive;
    private String avatar;
}
