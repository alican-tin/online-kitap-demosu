type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <label className="search-input">
      <span className="sr-only">Arama</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Başlık veya yazar ara'}
      />
    </label>
  );
}
