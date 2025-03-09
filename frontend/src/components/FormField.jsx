const FormField = ({
  label,
  id,
  type = "text",
  className = "",
  defaultValue = "",
  placeholder = "",
  required = false,
  maxLength,
  index = 0,
  ...props
}) => {
  return (
    <div className={`space-y-2 animate-fade-in-up ${className}`} style={{ animationDelay: `${index * 50}ms` }}>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-jpcsred focus:border-jpcsred block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-jpcsred dark:focus:border-jpcsred focus:outline-jpcsred transition-all duration-200 focus:scale-[1.01]"
        {...props}
      />
    </div>
  )
}

export default FormField

