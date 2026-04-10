import './SearchInput.css'

function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  icon = 'filter_list',
  className = ''
}) {
  return (
    <div className={`search-input ${className}`}>
      <span className="material-symbols-outlined search-input__icon">{icon}</span>
      <input
        type="text"
        className="search-input__field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default SearchInput
