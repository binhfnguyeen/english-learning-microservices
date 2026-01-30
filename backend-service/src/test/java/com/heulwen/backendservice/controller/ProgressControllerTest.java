package com.heulwen.backendservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;
import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;

@WebMvcTest(controllers = ProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProgressControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProgressService progressService;

    @Autowired
    private ObjectMapper objectMapper;

    private ProgressOverviewDto mockProgressOverviewDto;
    private ProgressDto mockProgressDto;
    private final Long USER_ID = 1L;

    @BeforeEach
    void initData(){
        mockProgressOverviewDto = ProgressOverviewDto.builder()
                .daysStudied(10)
                .wordsLearned(50)
                .level("A2")
                .user(UserDto.builder().id(USER_ID).username("testuser").build()).build()
        ;

        mockProgressDto = ProgressDto.builder()
                .id(100L)
                .userId(USER_ID)
                .learnedDate(LocalDateTime.now()).build();
    }

    @Test
    void getUserProgress_success() throws Exception {
        Mockito.when(progressService.getProgressOverview(USER_ID)).thenReturn(mockProgressOverviewDto);

        mockMvc.perform(MockMvcRequestBuilders
                .get("/api/progress/{userId}/overview", USER_ID)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(1000))
                .andExpect(MockMvcResultMatchers.jsonPath("$.result.level").value("A2"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.result.wordsLearned").value(50));

    }

    @Test
    void trackDailyProgress_success() throws Exception {
        Mockito.when(progressService.trackDailyProgress(USER_ID))
                .thenReturn(mockProgressDto);

        mockMvc.perform(MockMvcRequestBuilders
                        .post("/api/progress/{userId}/date-learned", USER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(1000))
                .andExpect(MockMvcResultMatchers.jsonPath("$.result.userId").value(USER_ID))
                .andExpect(MockMvcResultMatchers.jsonPath("$.result.id").value(100L));
    }
}
