'use client'

import { useState, useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
  disabled?: boolean
}

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  className,
  disabled = false
}: NumberStepperProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
    setInputValue(newValue.toString())
  }, [value, step, max, onChange])

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
    setInputValue(newValue.toString())
  }, [value, step, min, onChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)
    
    const numValue = parseInt(inputVal) || 0
    if (numValue >= min && numValue <= max) {
      onChange(numValue)
    }
  }, [min, max, onChange])

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue) || 0
    const clampedValue = Math.max(min, Math.min(numValue, max))
    onChange(clampedValue)
    setInputValue(clampedValue.toString())
  }, [inputValue, min, max, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(
            'p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            value <= min && 'text-gray-400'
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Number Input */}
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-sm font-medium'
          )}
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(
            'p-2 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            value >= max && 'text-gray-400'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
