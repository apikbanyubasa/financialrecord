package com.financialrecord.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envPath = findDotenvPath();
        if (envPath != null && Files.exists(envPath)) {
            Map<String, Object> envProperties = new HashMap<>();
            try (BufferedReader reader = Files.newBufferedReader(envPath, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();
                        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }
                        envProperties.put(key, val);
                    }
                }
            } catch (Exception ignored) {
            }

            if (!envProperties.isEmpty()) {
                environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envProperties));
                System.out.println("✅ [Dotenv] Memuat " + envProperties.size() + " variabel konfigurasi dari: " + envPath.toAbsolutePath());
            }
        }
    }

    private Path findDotenvPath() {
        String[] candidates = new String[]{
                ".env",
                "backend/.env",
                "../.env",
                System.getProperty("user.dir") + "/.env",
                System.getProperty("user.dir") + "/backend/.env"
        };
        for (String c : candidates) {
            try {
                Path p = Paths.get(c);
                if (Files.exists(p) && !Files.isDirectory(p)) {
                    return p;
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
