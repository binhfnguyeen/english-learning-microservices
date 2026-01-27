package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.AuthenticateDto;
import com.heulwen.backendservice.form.AuthenticateForm;

public interface AuthenticateService {
    AuthenticateDto authenticate(AuthenticateForm form);
}
