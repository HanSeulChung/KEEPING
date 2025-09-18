'use client'

interface InputFieldProps {
  label?: string
  placeholder?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Inputfield({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-bold">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="founded w-full border px-3 py-2"
      />
    </div>
  )
}
