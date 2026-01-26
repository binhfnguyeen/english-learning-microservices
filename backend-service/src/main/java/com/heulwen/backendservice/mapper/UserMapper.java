/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.UserCreationRequest;
import com.heulwen.backendservice.dto.response.UserResponse;
import com.heulwen.backendservice.model.User;
import org.mapstruct.Mapper;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    UserResponse toUserResponse(User user);
}
