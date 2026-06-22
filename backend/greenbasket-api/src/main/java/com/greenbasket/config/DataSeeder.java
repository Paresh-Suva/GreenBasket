package com.greenbasket.config;

import com.greenbasket.modules.auth.entity.Role;
import com.greenbasket.modules.auth.entity.UserRole;
import com.greenbasket.modules.auth.enums.RoleCode;
import com.greenbasket.modules.auth.repository.RoleRepository;
import com.greenbasket.modules.auth.repository.UserRoleRepository;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.enums.AccountStatus;
import com.greenbasket.modules.users.enums.UserStatus;
import com.greenbasket.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Data seeder execution: bypassed (database is already pre-populated).");
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            log.info("Seeding roles...");
            for (RoleCode roleCode : RoleCode.values()) {
                Role role = new Role();
                role.setCode(roleCode);
                role.setName(roleCode.name().replace("_", " "));
                roleRepository.save(role);
            }
            log.info("Roles seeded successfully.");
        }
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail("admin@greenbasket.com")) {
            log.info("Seeding super admin user...");
            Role superAdminRole = roleRepository.findByCode(RoleCode.SUPER_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Super Admin role not found"));

            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email("admin@greenbasket.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .phoneNumber("+1234567890")
                    .status(UserStatus.ACTIVE)
                    .accountStatus(AccountStatus.ENABLED)
                    .emailVerified(true)
                    .build();

            admin = userRepository.save(admin);
            
            UserRole userRole = UserRole.builder()
                    .user(admin)
                    .role(superAdminRole)
                    .build();
            userRoleRepository.save(userRole);
            
            log.info("Super admin seeded successfully.");
        }
    }

    private void seedStaffUser() {
        if (!userRepository.existsByEmail("staff@greenbasket.com")) {
            log.info("Seeding staff user...");
            Role staffRole = roleRepository.findByCode(RoleCode.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Staff role not found"));

            User staff = User.builder()
                    .firstName("GreenBasket")
                    .lastName("Staff")
                    .email("staff@greenbasket.com")
                    .passwordHash(passwordEncoder.encode("Staff@123"))
                    .phoneNumber("+1987654321")
                    .status(UserStatus.ACTIVE)
                    .accountStatus(AccountStatus.ENABLED)
                    .emailVerified(true)
                    .build();

            staff = userRepository.save(staff);
            
            UserRole userRole = UserRole.builder()
                    .user(staff)
                    .role(staffRole)
                    .build();
            userRoleRepository.save(userRole);
            
            log.info("Staff user seeded successfully.");
        }
    }
}
