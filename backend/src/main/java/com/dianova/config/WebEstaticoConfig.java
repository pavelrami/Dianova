package com.dianova.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Opcional: sirve el build de React desde la misma API (útil en un VPS sin Nginx).
 * Se activa con dianova.web.directorio=/ruta/a/dist. Cualquier ruta que no sea /api
 * ni un archivo existente devuelve index.html para que React Router la resuelva.
 * Con Nginx (deploy/nginx/dianova.conf) esta propiedad se deja vacía.
 */
@Configuration
public class WebEstaticoConfig implements WebMvcConfigurer {

    private final String directorio;

    public WebEstaticoConfig(@Value("${dianova.web.directorio:}") String directorio) {
        this.directorio = directorio == null ? "" : directorio.trim();
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        if (!directorio.isEmpty()) registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (directorio.isEmpty()) return;
        String base = directorio.endsWith("/") ? directorio : directorio + "/";
        Resource index = new FileSystemResource(base + "index.html");
        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + base)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String ruta, Resource ubicacion) throws IOException {
                        if (ruta.startsWith("api/") || ruta.equals("api")) return null;
                        Resource r = ubicacion.createRelative(ruta);
                        if (r.exists() && r.isReadable()) return r;
                        // Un archivo que no existe (por ejemplo /assets/x.js) da 404; una ruta de React da index.html
                        if (ruta.substring(ruta.lastIndexOf('/') + 1).contains(".")) return null;
                        return index.exists() ? index : null;
                    }
                });
    }
}
