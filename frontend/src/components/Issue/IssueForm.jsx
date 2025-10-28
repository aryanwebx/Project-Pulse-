import { useState, useRef } from 'react'

const IssueForm = ({ onSubmit, onCancel, loading, community }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    location: '',
    images: []
  })
  const [errors, setErrors] = useState({})
  const [imagePreviews, setImagePreviews] = useState([])
  const fileInputRef = useRef(null)

  // Get categories from community settings or use defaults
  const categories = community?.community?.settings?.categories;

  const urgencyOptions = [
    { value: 'low', label: 'Low', description: 'Minor issue, no immediate action needed' },
    { value: 'medium', label: 'Medium', description: 'Should be addressed soon' },
    { value: 'high', label: 'High', description: 'Needs immediate attention' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB limit
      
      if (!isValidType) {
        alert('Please upload only image files')
        return false
      }
      
      if (!isValidSize) {
        alert('Image size should be less than 5MB')
        return false
      }
      
      return true
    })

    // Create previews for valid files
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setImagePreviews(prev => [...prev, ...newPreviews])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }))

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index)
    const updatedImages = formData.images.filter((_, i) => i !== index)
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].preview)
    
    setImagePreviews(updatedPreviews)
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Briefly describe the issue..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about the issue..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Category and Urgency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Urgency Field */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level *
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={loading}
            >
              {urgencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              How urgent is this issue?
            </p>
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where is this issue located? (e.g., Near Building A, Parking Lot, etc.)"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.location ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (Optional)
          </label>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {imagePreviews.length} photo(s) selected
              </p>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
            <div className="space-y-2">
              <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Click to upload
                </button>
                <p className="text-gray-500 text-sm">or drag and drop</p>
              </div>
              <p className="text-gray-400 text-xs">
                PNG, JPG, GIF up to 5MB each
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions Placeholder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">AI Suggestions</h4>
              <p className="text-blue-700 text-sm mt-1">
                Based on your description, this issue appears to be related to <strong>{formData.category || 'general maintenance'}</strong>. 
                {formData.urgency === 'high' && ' This has been flagged as high priority due to safety concerns.'}
              </p>
              {formData.description.length > 20 && (
                <div className="mt-2">
                  <p className="text-blue-700 text-sm font-medium">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {formData.category?.toLowerCase() || 'maintenance'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {formData.urgency}-priority
                    </span>
                    {formData.location && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {formData.location.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Fields marked with * are required
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Report Issue</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default IssueForm