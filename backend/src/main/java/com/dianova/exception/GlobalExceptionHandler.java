package com.dianova.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Traduce cualquier excepción a JSON con el código HTTP correcto:
 * 400 datos inválidos · 401 sin sesión · 403 sin permiso · 404 no existe · 422 regla de negocio · 500 error interno.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** @Valid sobre el cuerpo de la petición: un mensaje por campo. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorApi> validacion(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        // Errores de clase (por ejemplo, "fin debe ser posterior al inicio")
        ex.getBindingResult().getGlobalErrors().forEach(ge ->
                errores.putIfAbsent(campoGlobal(ge.getCode()), ge.getDefaultMessage()));
        return responder(HttpStatus.BAD_REQUEST, "Revisa los datos marcados", req, errores);
    }

    @ExceptionHandler({ConstraintViolationException.class, HandlerMethodValidationException.class})
    public ResponseEntity<ErrorApi> validacionParametros(Exception ex, HttpServletRequest req) {
        return responder(HttpStatus.BAD_REQUEST, "Parámetros inválidos", req, Map.of());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorApi> cuerpoIlegible(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido o tiene valores con formato incorrecto", req, Map.of());
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class, PropertyReferenceException.class})
    public ResponseEntity<ErrorApi> parametroInvalido(Exception ex, HttpServletRequest req) {
        return responder(HttpStatus.BAD_REQUEST, "Parámetro inválido: " + ex.getMessage(), req, Map.of());
    }

    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<ErrorApi> credenciales(BadCredentialsException ex, HttpServletRequest req) {
        return responder(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", req, Map.of());
    }

    @ExceptionHandler({DisabledException.class})
    public ResponseEntity<ErrorApi> deshabilitado(DisabledException ex, HttpServletRequest req) {
        return responder(HttpStatus.UNAUTHORIZED, "Tu cuenta está desactivada. Contacta al administrador", req, Map.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorApi> autenticacion(AuthenticationException ex, HttpServletRequest req) {
        return responder(HttpStatus.UNAUTHORIZED, "Necesitas iniciar sesión", req, Map.of());
    }

    /** Incluye AuthorizationDeniedException de @PreAuthorize y AccesoDenegadoException de los servicios. */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorApi> accesoDenegado(AccessDeniedException ex, HttpServletRequest req) {
        String mensaje = ex instanceof AccesoDenegadoException ? ex.getMessage() : "No tienes permiso para realizar esta acción";
        return responder(HttpStatus.FORBIDDEN, mensaje, req, Map.of());
    }

    @ExceptionHandler({RecursoNoEncontradoException.class})
    public ResponseEntity<ErrorApi> noEncontrado(RecursoNoEncontradoException ex, HttpServletRequest req) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), req, Map.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorApi> rutaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return responder(HttpStatus.NOT_FOUND, "La ruta solicitada no existe", req, Map.of());
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorApi> reglaNegocio(ReglaNegocioException ex, HttpServletRequest req) {
        return responder(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), req, ex.getErrores());
    }

    /** Respaldo: una restricción UNIQUE/FK/CHECK de MySQL que se escapó de las validaciones del servicio. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorApi> integridad(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Violación de integridad en {}: {}", req.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.UNPROCESSABLE_ENTITY, "La operación entra en conflicto con datos existentes", req, Map.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorApi> metodo(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP no permitido en esta ruta", req, Map.of());
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorApi> tipoMedio(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return responder(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Envía el cuerpo como application/json", req, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorApi> inesperado(Exception ex, HttpServletRequest req) {
        log.error("Error no controlado en {}", req.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error interno. Intenta de nuevo más tarde", req, Map.of());
    }

    private ResponseEntity<ErrorApi> responder(HttpStatus status, String mensaje, HttpServletRequest req, Map<String, String> errores) {
        return ResponseEntity.status(status)
                .body(ErrorApi.de(status.value(), status.getReasonPhrase(), mensaje, req.getRequestURI(), errores));
    }

    /** Las restricciones de clase indican en su código a qué campo pertenece el mensaje. */
    private String campoGlobal(String codigo) {
        if ("RangoValido".equals(codigo)) return "fin";
        if ("DestinoUnico".equals(codigo)) return "destino";
        return "general";
    }
}
