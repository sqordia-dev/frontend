import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "currency"
    | "percentage"
    | "select"
    | "multiselect"
    | "radio"
    | "checkbox"
    | "date"
    | "email"
    | "url"
    | "phone";
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: QuestionOption[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface QuestionFieldProps {
  question: Question;
  name: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function QuestionField({
  question,
  name,
  className,
  disabled,
  autoFocus,
}: QuestionFieldProps) {
  const { control } = useFormContext();

  const renderField = () => {
    switch (question.type) {
      case "text":
      case "email":
      case "url":
      case "phone":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type={question.type === "text" ? "text" : question.type}
                    placeholder={question.placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    {...field}
                  />
                </FormControl>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={question.placeholder}
                    disabled={disabled}
                    autoFocus={autoFocus}
                    className="min-h-[120px] resize-y"
                    maxLength={question.maxLength}
                    {...field}
                  />
                </FormControl>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                {question.maxLength && (
                  <div className="text-xs text-muted-foreground text-right">
                    {field.value?.length || 0} / {question.maxLength}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
      case "currency":
      case "percentage":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    {question.type === "currency" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                    )}
                    <Input
                      type="number"
                      placeholder={question.placeholder}
                      disabled={disabled}
                      autoFocus={autoFocus}
                      min={question.min}
                      max={question.max}
                      className={cn(
                        question.type === "currency" && "pl-7",
                        question.type === "percentage" && "pr-8"
                      )}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : Number(value));
                      }}
                    />
                    {question.type === "percentage" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    )}
                  </div>
                </FormControl>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={question.placeholder || "Select an option"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {question.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "radio":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={cn("space-y-3", className)}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={disabled}
                    className="flex flex-col space-y-2"
                  >
                    {question.options?.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                        <Label
                          htmlFor={`${name}-${option.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {option.label}
                          {option.description && (
                            <span className="block text-sm text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "checkbox":
      case "multiselect":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <div className="space-y-2">
                  {question.options?.map((option) => {
                    const isChecked = (field.value as string[] || []).includes(
                      option.value
                    );
                    return (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          id={`${name}-${option.value}`}
                          checked={isChecked}
                          disabled={disabled}
                          onChange={(e) => {
                            const currentValue = (field.value as string[]) || [];
                            if (e.target.checked) {
                              field.onChange([...currentValue, option.value]);
                            } else {
                              field.onChange(
                                currentValue.filter((v) => v !== option.value)
                              );
                            }
                          }}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <Label
                          htmlFor={`${name}-${option.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "date":
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>
                  {question.label}
                  {question.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={disabled}
                    autoFocus={autoFocus}
                    {...field}
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : field.value || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? new Date(value) : null);
                    }}
                  />
                </FormControl>
                {question.helpText && (
                  <FormDescription>{question.helpText}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={className}>
                <FormLabel>{question.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={question.placeholder}
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return renderField();
}
