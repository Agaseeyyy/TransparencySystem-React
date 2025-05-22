package com.agaseeyyy.transparencysystem.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountRepository accountRepository;

    public UserDetailsServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Accounts account = accountRepository.findByEmail(email);
        
        if (account == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        
        // Create a granted authority from the role
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(account.getRole().name());
        
        // Build a Spring Security UserDetails object
        return new User(
            account.getEmail(),
            account.getPassword(),
            Collections.singleton(authority)
        );
    }
} 