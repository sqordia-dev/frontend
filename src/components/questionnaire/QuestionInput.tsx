import React from 'react';
import { QuestionInputProps, Answer } from '../../types/questionnaire';
import {
  TextInput,
  TextareaInput,
  SelectInput,
  MultiSelectInput,
  NumberInput,
  DateInput,
} from './inputs';

/**
 * QuestionInput Component
 * Smart input that renders the appropriate input based on question type
 */
export default function QuestionInput({
  question,
  value,
  onChange,
  autoFocus,
}: QuestionInputProps) {
  const inputId = `question-input-${question.id}`;
  const descriptionId = `question-description-${question.id}`;

  // Render appropriate input based on question type
  switch (question.type) {
    case 'text':
      return (
        <TextInput
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          autoFocus={autoFocus}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    case 'textarea':
      return (
        <TextareaInput
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          autoFocus={autoFocus}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    case 'select':
      return (
        <SelectInput
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v)}
          options={question.options || []}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    case 'multiselect':
      return (
        <MultiSelectInput
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v)}
          options={question.options || []}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    case 'number':
      return (
        <NumberInput
          value={typeof value === 'number' ? value : null}
          onChange={(v) => onChange(v)}
          min={question.min}
          max={question.max}
          step={question.step}
          prefix={question.prefix}
          suffix={question.suffix}
          placeholder={question.placeholder}
          autoFocus={autoFocus}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    case 'date':
      return (
        <DateInput
          value={value instanceof Date ? value : null}
          onChange={(v) => onChange(v)}
          autoFocus={autoFocus}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );

    default:
      // Default to textarea for unknown types
      return (
        <TextareaInput
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          autoFocus={autoFocus}
          id={inputId}
          aria-describedby={question.description ? descriptionId : undefined}
        />
      );
  }
}
