'use client'

interface InputFieldProps {
  label?: string
  placeholder?: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

<<<<<<< HEAD
export default function Inputfield({
=======
export function Input({
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
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
<<<<<<< HEAD
=======
export default Input
>>>>>>> 2d04896a4a9e248fba0a61cd5e1698366d362bbf
