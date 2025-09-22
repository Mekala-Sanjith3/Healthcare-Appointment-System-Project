package com.hsa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@Table(name = "admins")
public class Admin extends User {
    @Column(nullable = false)
    private String department;

    @Column
    private String contactNumber;

    public Admin(String name, String email, String password, String department, String contactNumber) {
        super();
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole(Role.ADMIN);
        setCreatedAt(java.time.LocalDateTime.now());
        setUpdatedAt(java.time.LocalDateTime.now());
        this.department = department;
        this.contactNumber = contactNumber;
    }
} 