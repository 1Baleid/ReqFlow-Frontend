import { useState, useRef, useEffect } from 'react'
import './Dropdown.css'

function Dropdown({
  label,
  options = [],
  value = [],
  onChange,
  multiple = false,
  placeholder = 'Select...',
  icon = null,
  searchable = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (option) => {
    if (multiple) {
      const isSelected = value.includes(option.value)
      const newValue = isSelected
        ? value.filter(v => v !== option.value)
        : [...value, option.value]
      onChange(newValue)
    } else {
      onChange(option.value)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange(multiple ? [] : null)
  }

  const getDisplayValue = () => {
    if (multiple) {
      if (value.length === 0) return placeholder
      if (value.length === 1) {
        const opt = options.find(o => o.value === value[0])
        return opt?.label || value[0]
      }
      return `${value.length} selected`
    } else {
      const opt = options.find(o => o.value === value)
      return opt?.label || placeholder
    }
  }

  const hasValue = multiple ? value.length > 0 : value !== null && value !== undefined

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${isOpen ? 'dropdown--open' : ''} ${disabled ? 'dropdown--disabled' : ''}`}
    >
      {label && <label className="dropdown__label">{label}</label>}

      <button
        type="button"
        className={`dropdown__trigger ${hasValue ? 'dropdown__trigger--has-value' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        {icon && (
          <span className="material-symbols-outlined dropdown__icon">{icon}</span>
        )}
        <span className="dropdown__value">{getDisplayValue()}</span>
        {hasValue && (
          <button
            type="button"
            className="dropdown__clear"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        <span className="material-symbols-outlined dropdown__arrow">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="dropdown__menu">
          {searchable && (
            <div className="dropdown__search">
              <span className="material-symbols-outlined dropdown__search-icon">search</span>
              <input
                ref={searchInputRef}
                type="text"
                className="dropdown__search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="dropdown__options">
            {filteredOptions.length === 0 ? (
              <div className="dropdown__empty">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? value.includes(option.value)
                  : value === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`dropdown__option ${isSelected ? 'dropdown__option--selected' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    {multiple && (
                      <span className={`dropdown__checkbox ${isSelected ? 'dropdown__checkbox--checked' : ''}`}>
                        {isSelected && (
                          <span className="material-symbols-outlined">check</span>
                        )}
                      </span>
                    )}
                    {option.color && (
                      <span
                        className="dropdown__option-dot"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    {option.icon && (
                      <span className="material-symbols-outlined dropdown__option-icon">
                        {option.icon}
                      </span>
                    )}
                    <span className="dropdown__option-label">{option.label}</span>
                    {!multiple && isSelected && (
                      <span className="material-symbols-outlined dropdown__check">check</span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {multiple && value.length > 0 && (
            <div className="dropdown__footer">
              <button
                type="button"
                className="dropdown__clear-all"
                onClick={handleClear}
              >
                Clear all ({value.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dropdown
