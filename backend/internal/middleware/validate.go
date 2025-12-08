package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New(validator.WithRequiredStructEnabled())

	// Кастомна валідація hexcolor (наприклад, для скінів)
	_ = validate.RegisterValidation("hexcolor", func(fl validator.FieldLevel) bool {
		s := fl.Field().String()
		return len(s) == 7 && s[0] == '#'
	})
}

func ValidateJSON(model any) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				jsonError(w, "Cannot read request body", http.StatusBadRequest)
				return
			}
			defer r.Body.Close()

			r.Body = io.NopCloser(bytes.NewBuffer(body))

			if err := json.Unmarshal(body, model); err != nil {
				jsonError(w, "Invalid JSON format", http.StatusBadRequest)
				return
			}

			if err := validate.Struct(model); err != nil {
				var errors []string
				for _, e := range err.(validator.ValidationErrors) {
					errors = append(errors, fmt.Sprintf(
						"Поле '%s': значення '%v' не проходить валідацію '%s'",
						e.Field(), e.Value(), e.Tag(),
					))
				}

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				_ = json.NewEncoder(w).Encode(map[string]any{
					"error":   "Validation failed",
					"details": errors,
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func jsonError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}
