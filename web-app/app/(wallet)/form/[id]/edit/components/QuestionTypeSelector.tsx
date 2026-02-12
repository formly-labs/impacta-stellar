'use client';

import { FieldInput } from '@/types';
import { AlignLeft, FileText, Mail, Phone, Hash, CheckSquare, Circle, ChevronDown, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const QUESTION_TYPES = [
  { 
    value: 'text', 
    label: 'Pregunta corta', 
    icon: AlignLeft,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  { 
    value: 'long_text', 
    label: 'Pregunta larga', 
    icon: FileText,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  { 
    value: 'email', 
    label: 'Email', 
    icon: Mail,
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700'
  },
  { 
    value: 'phone', 
    label: 'Teléfono', 
    icon: Phone,
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700'
  },
  { 
    value: 'number', 
    label: 'Número', 
    icon: Hash,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700'
  },
  { 
    value: 'radio', 
    label: 'Opción única', 
    icon: Circle,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700'
  },
  { 
    value: 'checkbox', 
    label: 'Opción múltiple', 
    icon: CheckSquare,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700'
  },
];

interface QuestionTypeSelectorProps {
  value: FieldInput['type'];
  onChange: (type: FieldInput['type']) => void;
}

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = QUESTION_TYPES.find(t => t.value === value);
  const SelectedIcon = selectedType?.icon || AlignLeft;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón selector - Sin border */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none"
      >
        <div className={`flex h-6 w-6 items-center justify-center rounded ${selectedType?.bgColor || 'bg-gray-100'}`}>
          <SelectedIcon className="h-3.5 w-3.5 text-gray-700" />
        </div>
        <span>{selectedType?.label || 'Seleccionar tipo'}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown personalizado */}
      {isOpen && (
        <>
          <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1">
              {QUESTION_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = value === type.value;
                
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      onChange(type.value as FieldInput['type']);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                      isSelected 
                        ? 'bg-gray-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Icono con color */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${type.bgColor}`}>
                      <TypeIcon className="h-4 w-4 text-gray-700" />
                    </div>
                    
                    {/* Label */}
                    <span className="flex-1 text-sm font-medium text-gray-900">
                      {type.label}
                    </span>
                    
                    {/* Check cuando está seleccionado */}
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
