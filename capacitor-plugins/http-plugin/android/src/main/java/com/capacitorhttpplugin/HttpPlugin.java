package com.capacitorhttpplugin;

import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;

@CapacitorPlugin(name = "HttpPlugin")
public class HttpPlugin extends Plugin {
    private static final String TAG = "HttpPlugin";

    @PluginMethod
    public void request(PluginCall call) {
        String urlString = call.getString("url");
        String method = call.getString("method", "GET");
        JSObject headers = call.getObject("headers", new JSObject());
        JSObject data = call.getObject("data");

        if (urlString == null) {
            call.reject("URL is required");
            return;
        }

        new Thread(() -> {
            try {
                URL url = new URL(urlString);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod(method);

                // Set headers
                Iterator<String> headerKeys = headers.keys();
                while (headerKeys.hasNext()) {
                    String key = headerKeys.next();
                    String value = headers.getString(key);
                    connection.setRequestProperty(key, value);
                }

                // Set content type if not specified
                if (!headers.has("Content-Type") && !method.equals("GET")) {
                    connection.setRequestProperty("Content-Type", "application/json");
                }

                // Add request body for non-GET requests
                if (data != null && !method.equals("GET")) {
                    connection.setDoOutput(true);
                    try (OutputStream os = connection.getOutputStream()) {
                        byte[] input = data.toString().getBytes("utf-8");
                        os.write(input, 0, input.length);
                    }
                }

                // Get response
                int statusCode = connection.getResponseCode();
                InputStream inputStream;
                if (statusCode >= 400) {
                    inputStream = connection.getErrorStream();
                } else {
                    inputStream = connection.getInputStream();
                }

                // Read response
                StringBuilder response = new StringBuilder();
                try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, "utf-8"))) {
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                }

                // Get response headers
                JSObject responseHeaders = new JSObject();
                for (Map.Entry<String, java.util.List<String>> entry : connection.getHeaderFields().entrySet()) {
                    if (entry.getKey() != null) {
                        responseHeaders.put(entry.getKey(), entry.getValue().get(0));
                    }
                }

                // Parse response data
                JSObject responseData = new JSObject();
                try {
                    String contentType = connection.getContentType();
                    if (contentType != null && contentType.contains("application/json")) {
                        JSONObject jsonObject = new JSONObject(response.toString());
                        Iterator<String> keys = jsonObject.keys();
                        while (keys.hasNext()) {
                            String key = keys.next();
                            responseData.put(key, jsonObject.get(key));
                        }
                    } else {
                        responseData.put("text", response.toString());
                    }
                } catch (JSONException e) {
                    responseData.put("text", response.toString());
                }

                // Create result
                JSObject result = new JSObject();
                result.put("status", statusCode);
                result.put("headers", responseHeaders);
                result.put("data", responseData);

                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Error making HTTP request", e);
                call.reject("Error making HTTP request: " + e.getMessage(), e);
            }
        }).start();
    }

    @PluginMethod
    public void get(PluginCall call) {
        call.getData().put("method", "GET");
        request(call);
    }

    @PluginMethod
    public void post(PluginCall call) {
        call.getData().put("method", "POST");
        request(call);
    }
}
