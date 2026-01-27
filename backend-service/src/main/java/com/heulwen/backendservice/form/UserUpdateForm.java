package com.heulwen.backendservice.form;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UserUpdateForm {
    private String firstName;
    private String lastName;
    private String phone;
    private Boolean isActive;
    private String avatar;
}
