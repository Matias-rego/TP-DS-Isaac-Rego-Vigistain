import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
}

export function PasswordInput({ value, onChange, required, className }: PasswordInputProps) {
  const [show, setShow] = useState(false)

 return (
  <div className="relative w-full">
    <Input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      required={required}
      className={`pr-10 ${className ?? ''}`}
    />
    <button
      type="button"
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
      onClick={() => setShow(!show)}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
)
}