package com.hsa.controller;

import com.hsa.model.Staff;
import com.hsa.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StaffController {

    private final StaffRepository staffRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Staff>> getAll() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> create(@RequestBody Staff staff) {
        Staff saved = staffRepository.save(staff);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> update(@PathVariable Long id, @RequestBody Staff update) {
        return staffRepository.findById(id)
                .map(existing -> {
                    existing.setName(update.getName());
                    existing.setRole(update.getRole());
                    existing.setDepartment(update.getDepartment());
                    existing.setEmail(update.getEmail());
                    existing.setPhone(update.getPhone());
                    existing.setStatus(update.getStatus());
                    Staff saved = staffRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!staffRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        staffRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


