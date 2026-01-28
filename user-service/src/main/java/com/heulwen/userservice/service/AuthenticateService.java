package com.heulwen.userservice.service;

import com.heulwen.userservice.dto.AuthenticateDto;
import com.heulwen.userservice.form.AuthenticateForm;

public interface AuthenticateService {
    AuthenticateDto authenticate(AuthenticateForm form);
}
