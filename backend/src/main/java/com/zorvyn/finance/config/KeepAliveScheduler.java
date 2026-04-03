package com.zorvyn.finance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class KeepAliveScheduler {

    @Value("${app.keep-alive.url:}")
    private String keepAliveUrl;

    @Scheduled(fixedRate = 600000)
    public void pingSelf() {
        if (keepAliveUrl == null || keepAliveUrl.isBlank()) {
            return;
        }

        try {
            URL url = new URL(keepAliveUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            int status = connection.getResponseCode();
            System.out.println("Keep-alive ping sent. Response: " + status);
            connection.disconnect();
        } catch (Exception e) {
            System.out.println("Keep-alive ping failed: " + e.getMessage());
        }
    }
}
