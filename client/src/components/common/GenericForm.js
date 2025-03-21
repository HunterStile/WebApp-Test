import React, { useState, useEffect } from 'react';

const GenericForm = ({ 
  title, 
  fields, 
  initialData, 
  onSubmit, 
  onClose, 
  submitButtonLabel = 'Salva', 
  cancelButtonLabel = 'Annulla' 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form with initial data or empty values
  useEffect(() => {
    const initialFormData = {};
    fields.forEach((field) => {
      // Handle nested fields (e.g. foodDetails.foodName)
      if (field.name.includes('.')) {
        const [parentKey, childKey] = field.name.split('.');
        
        if (initialData && initialData[parentKey] && initialData[parentKey][childKey] !== undefined) {
          // Format date values for inputs
          if (field.type === 'date' && initialData[parentKey][childKey]) {
            let dateValue = initialData[parentKey][childKey];
            
            if (typeof dateValue === 'string') {
              dateValue = new Date(dateValue);
            }
            
            if (dateValue instanceof Date) {
              initialFormData[field.name] = dateValue.toISOString().split('T')[0];
            }
          } else {
            initialFormData[field.name] = initialData[parentKey][childKey];
          }
        } else {
          initialFormData[field.name] = field.defaultValue || '';
        }
      } else {
        // Handle regular fields
        if (initialData && initialData[field.name] !== undefined) {
          // Format date values for inputs
          if (field.type === 'date' && initialData[field.name]) {
            let dateValue = initialData[field.name];
            
            if (typeof dateValue === 'string') {
              dateValue = new Date(dateValue);
            }
            
            if (dateValue instanceof Date) {
              initialFormData[field.name] = dateValue.toISOString().split('T')[0];
            }
          } else {
            initialFormData[field.name] = initialData[field.name];
          }
        } else {
          initialFormData[field.name] = field.defaultValue || '';
        }
      }
    });
    
    setFormData(initialFormData);
  }, [initialData, fields]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // For select elements that need to handle objects or IDs
    if (type === 'select-one') {
      const selectedField = fields.find(f => f.name === name);
      
      if (selectedField && selectedField.options) {
        // Check if this is a field that needs special handling for objects
        if (selectedField.valueType === 'object') {
          const selectedOption = selectedField.options.find(opt => opt.value === value);
          setFormData({
            ...formData,
            [name]: selectedOption ? selectedOption.object : value
          });
        } else {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      // Regular input fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    fields.forEach((field) => {
      // Skip validation if the field is not required
      if (!field.required) return;
      
      // Get the value, handling nested fields
      let value;
      if (field.name.includes('.')) {
        value = formData[field.name];
      } else {
        value = formData[field.name];
      }
      
      // Check for required fields
      if (value === undefined || value === null || value === '') {
        newErrors[field.name] = `${field.label} è obbligatorio`;
      }
      
      // Validate based on field type
      if (value && field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field.name] = 'Email non valida';
      }
      
      // Add custom validation
      if (field.validate && typeof field.validate === 'function') {
        const customError = field.validate(value);
        if (customError) {
          newErrors[field.name] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Transform the flat form data back into nested structure if needed
      const transformedData = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key.includes('.')) {
          const [parentKey, childKey] = key.split('.');
          
          if (!transformedData[parentKey]) {
            transformedData[parentKey] = {};
          }
          
          transformedData[parentKey][childKey] = value;
        } else {
          transformedData[key] = value;
        }
      });
      
      onSubmit(transformedData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div 
                key={field.name} 
                className={`mb-4 ${field.fullWidth ? 'md:col-span-2' : ''}`}
              >
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={typeof formData[field.name] === 'object' && formData[field.name]?._id 
                      ? formData[field.name]._id 
                      : formData[field.name] || ''}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    disabled={field.disabled}
                  >
                    <option value="">{field.placeholder || `Seleziona ${field.label}`}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    rows={field.rows || 3}
                    className={`block w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    disabled={field.disabled}
                  />
                )}
                
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
                
                {field.helpText && (
                  <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cancelButtonLabel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {submitButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenericForm; 