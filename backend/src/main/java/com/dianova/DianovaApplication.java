package com.dianova;

import com.dianova.config.DianovaProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties(DianovaProperties.class)
public class DianovaApplication {

    public static void main(String[] args) {
        SpringApplication.run(DianovaApplication.class, args);
    }
}
