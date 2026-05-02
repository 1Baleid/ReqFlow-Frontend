import { useState, useCallback } from 'react'

/**
 * Hook for managing loading states with error handling
 * @param {boolean} initialState - Initial loading state
 * @returns {Object} Loading state and controls
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [error, setError] = useState(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const setLoadingError = useCallback((err) => {
    setError(err)
    setIsLoading(false)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  /**
   * Wrap an async function with loading state management
   * @param {Function} asyncFn - Async function to wrap
   * @returns {Function} Wrapped function
   */
  const withLoading = useCallback((asyncFn) => {
    return async (...args) => {
      startLoading()
      try {
        const result = await asyncFn(...args)
        stopLoading()
        return result
      } catch (err) {
        setLoadingError(err)
        throw err
      }
    }
  }, [startLoading, stopLoading, setLoadingError])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    reset,
    withLoading
  }
}

/**
 * Hook for managing multiple loading states
 * @returns {Object} Multiple loading state controls
 */
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState({})
  const [errors, setErrors] = useState({})

  const startLoading = useCallback((key) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }))
    setErrors(prev => ({ ...prev, [key]: null }))
  }, [])

  const stopLoading = useCallback((key) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const setError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }))
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const getError = useCallback((key) => {
    return errors[key] || null
  }, [errors])

  const isAnyLoading = Object.values(loadingStates).some(Boolean)

  return {
    loadingStates,
    errors,
    startLoading,
    stopLoading,
    setError,
    isLoading,
    getError,
    isAnyLoading
  }
}

export default useLoading
