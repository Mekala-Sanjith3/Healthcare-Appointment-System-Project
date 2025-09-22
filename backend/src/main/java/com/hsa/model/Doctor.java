package com.hsa.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
public class Doctor implements UserDetails {
    @Id
    private String id;
    
    private String name;
    private String email;
    private String password;
    private String specialization;
    private String qualification;
    private String experience;
    private String clinicAddress;
    private String address;
    private String phoneNumber;
    private String bio;
    private String profileImageUrl;
    private String gender;
    private String status;
    private String profilePicture;
    private String credentialsFile;
    private Double consultationFee;
    private String availabilitySchedule;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Fields required by Spring Security
    private String role = "DOCTOR";
    private boolean accountNonExpired = true;
    private boolean accountNonLocked = true;
    private boolean credentialsNonExpired = true;
    private boolean enabled = true;
    
    public Doctor(String name, String email, String password, String specialization, 
                 String qualification, String experience, String clinicAddress) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.password = password;
        this.specialization = specialization;
        this.qualification = qualification;
        this.experience = experience;
        this.clinicAddress = clinicAddress;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Doctor(String id, String name, String email, String password, String specialization, 
                 String address, String phoneNumber, String bio, String profileImageUrl, 
                 String gender, String status, LocalDateTime createdAt, String role, 
                 boolean accountNonExpired, boolean accountNonLocked, 
                 boolean credentialsNonExpired, boolean enabled) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.specialization = specialization;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.gender = gender;
        this.status = status;
        this.createdAt = createdAt;
        this.role = role;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
        this.enabled = enabled;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
} 