package com.hsa.dto;

import com.hsa.model.User.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private Role role;
    private Long userId;
} 