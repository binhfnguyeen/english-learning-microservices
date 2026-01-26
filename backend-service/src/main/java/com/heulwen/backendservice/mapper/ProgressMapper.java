/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.response.ProgressResponse;
import com.heulwen.backendservice.model.Progress;
import org.mapstruct.Mapper;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring")
public interface ProgressMapper {
    ProgressResponse toProgressResponse(Progress progress);
}
