 package com.agaseeyyy.transparencysystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;

import com.agaseeyyy.transparencysystem.repository.UserRepository;
import com.agaseeyyy.transparencysystem.model.Users;

public class UserAuthService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername (String username) throws UsernameNotFoundException {
        Users user = userRepository.findByEmail(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found!");
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
      }

}