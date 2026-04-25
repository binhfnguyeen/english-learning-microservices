package com.heulwen.userservice.service;

import com.heulwen.userservice.dto.AuthenticateDto;
import com.heulwen.userservice.form.AuthenticateForm;
import com.heulwen.userservice.model.User;

public interface AuthenticateService {
    AuthenticateDto authenticate(AuthenticateForm form);
    String generateAccessTokenForRefresh(User user);
}
