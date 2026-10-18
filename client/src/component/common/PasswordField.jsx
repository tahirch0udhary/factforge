import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordField({ id, label, value, onChange, autoComplete = "current-password", placeholder = "Password", required = true }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="text-sm font-bold text-stone-700">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          className="input pr-12"
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 transition hover:text-stone-900"
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;