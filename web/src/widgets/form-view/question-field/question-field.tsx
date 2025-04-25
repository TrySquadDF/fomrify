'use client';

import React, { ComponentProps } from 'react'; // Import React for memo and useMemo
import { Question, QuestionType, Option as QuestionOption } from "@/src/gql/graphql";
import { UseFormReturn, ControllerRenderProps, FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, ChevronsUpDown } from "lucide-react";

import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Helper Components ---

// Memoized Label Component for reusability and performance
const MemoizedFormLabel = React.memo(({ text, required, htmlFor }: { text: string; required?: boolean; htmlFor?: string }) => (
  <FormLabel htmlFor={htmlFor} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
    {text}
  </FormLabel>
));
MemoizedFormLabel.displayName = 'MemoizedFormLabel';

// --- Input Type Components ---
// These components render the actual input element and associated logic.

const ShortTextInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Input {...field} value={field.value ?? ''} />
));
ShortTextInput.displayName = 'ShortTextInput';

const ParagraphInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Textarea rows={4} {...field} value={field.value ?? ''} />
));
ParagraphInput.displayName = 'ParagraphInput';

const BooleanInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Switch
    checked={field.value}
    onCheckedChange={field.onChange}
    aria-label={field.name} // Add aria-label for accessibility
  />
));
BooleanInput.displayName = 'BooleanInput';

const NumberInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Input
    type="number"
    {...field}
    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} // Allow unsetting the value, ensure number type
    value={field.value ?? ''} // Handle undefined/null for controlled input
  />
));
NumberInput.displayName = 'NumberInput';
type CustomPhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>, // Use standard HTML Input attributes
  "onChange" | "value" | "ref" // Omit conflicting props
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange" | "value"> & { // Omit value/onChange from RPNInput props as well
    onChange?: (value: RPNInput.Value | undefined) => void; // Allow undefined for onChange type
    value?: RPNInput.Value | undefined; // Allow undefined for value type
  };

// Use React.ComponentRef instead of the deprecated React.ElementRef
const PhoneInput: React.ForwardRefExoticComponent<CustomPhoneInputProps> =
  React.forwardRef<React.ComponentRef<typeof RPNInput.default>, CustomPhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInputComponent} // Use the custom input component
          smartCaret={false} // Set smartCaret as needed, false was in the example
          value={value} // Pass value directly
          /**
           * Handles the onChange event from react-phone-number-input.
           * Passes the value (which can be undefined if input is invalid/empty)
           * directly to the parent onChange handler.
           */
          onChange={onChange || (() => {})} // Provide fallback for undefined
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

// Custom Input component for react-phone-number-input, using shadcn Input
const PhoneInputComponent = React.forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn("rounded-e-lg rounded-s-none", className)} // Apply specific border radius
      {...props}
      ref={ref}
    />
  )
);
PhoneInputComponent.displayName = "PhoneInputComponent";

// Type for country entries in the select list
type CountryEntry = { label: string; value: RPNInput.Country }; // Value should be a valid Country

// Props for the CountrySelect component
type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country; // Currently selected country
  options: CountryEntry[]; // List of available countries
  onChange: (country: RPNInput.Country) => void; // Handler for country change
};

// Component to render the country select dropdown
const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  // Ensure options are valid
  const validCountryList = countryList.filter((c): c is CountryEntry => !!c.value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10", // Specific styling for integration
            disabled && "cursor-not-allowed opacity-50" // Disabled state styles
          )}
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry} // Pass countryName for accessibility/title
          />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4", // Consistent sizing
              disabled ? "hidden" : "opacity-50", // Hide chevron when disabled
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72"> {/* Limit height and enable scroll */}
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {validCountryList.map(({ value, label }) => (
                  <CountrySelectOption
                    key={value}
                    country={value}
                    countryName={label}
                    selectedCountry={selectedCountry}
                    onChange={onChange}
                  />
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
CountrySelect.displayName = "CountrySelect"; // Add display name

// Props for individual country options in the dropdown
interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

// Component to render a single country option
const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
}: CountrySelectOptionProps) => {
  return (
    <CommandItem
      className="gap-2 cursor-pointer" // Style as clickable
      onSelect={() => onChange(country)} // Trigger onChange on selection
      value={`${country}-${countryName}`} // Provide a unique value for Command filtering
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      {/* Display country calling code */}
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      {/* Show checkmark if this option is selected */}
      <CheckIcon
        className={cn(
            "ml-auto size-4",
            country === selectedCountry ? "opacity-100" : "opacity-0" // Conditional visibility
        )}
      />
    </CommandItem>
  );
};
CountrySelectOption.displayName = "CountrySelectOption"; // Add display name

// Component to render the country flag
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]; // Get the flag component based on the country code

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20"> {/* Container for flag */}
      {/* Render the flag SVG if it exists, ensuring it scales */}
      {/* @ts-expect-error - BAG */}
      {Flag ? <Flag title={countryName} className="[&_svg]:size-full" /> : null}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

const DateInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Popover>
    <PopoverTrigger asChild>
      <FormControl>
        <Button
          variant={"outline"}
          className={cn(
            "w-full pl-3 text-left font-normal hover:cursor-pointer",
            !field.value && "text-muted-foreground"
          )}
        >
          {field.value ? (
            format(new Date(field.value), "PPP") // Ensure value is Date compatible
          ) : (
            <span>Выберите дату</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </FormControl>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={field.value ? new Date(field.value) : undefined} // Ensure value is Date compatible
        onSelect={(date) => field.onChange(date?.toISOString())} // Store as ISO string or preferred format
        initialFocus
      />
    </PopoverContent>
  </Popover>
));
DateInput.displayName = 'DateInput';

const EmailInput = React.memo(({ field }: { field: ControllerRenderProps<FieldValues, string> }) => (
  <Input type="email" {...field} value={field.value ?? ''} />
));
EmailInput.displayName = 'EmailInput';

const SingleChoiceInput = React.memo(({ field, options }: { field: ControllerRenderProps<FieldValues, string>; options: QuestionOption[] }) => (
  <RadioGroup
    onValueChange={field.onChange}
    value={field.value} // Controlled component
    className="space-y-1"
  >
    {options.map((option) => (
      <div key={option.id} className="flex items-center space-x-2">
        <RadioGroupItem value={option.id} id={`${field.name}-${option.id}`} /> {/* Ensure unique ID */}
        <Label htmlFor={`${field.name}-${option.id}`}>{option.text}</Label>
      </div>
    ))}
  </RadioGroup>
));
SingleChoiceInput.displayName = 'SingleChoiceInput';

const MultipleChoiceInput = React.memo(({ field, options }: { field: ControllerRenderProps<FieldValues, string>; options: QuestionOption[] }) => {
  const valueSet = React.useMemo(() => new Set(field.value || []), [field.value]);

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isChecked = valueSet.has(option.id);
        const uniqueId = `${field.name}-${option.id}`; // Ensure unique ID
        return (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={uniqueId}
              checked={isChecked}
              onCheckedChange={(checked) => {
                const currentValues = Array.isArray(field.value) ? field.value : [];
                const newValues = checked
                  ? [...currentValues, option.id]
                  : currentValues.filter((value: string) => value !== option.id);
                field.onChange(newValues);
              }}
            />
            <Label htmlFor={uniqueId}>{option.text}</Label>
          </div>
        );
      })}
    </div>
  );
});
MultipleChoiceInput.displayName = 'MultipleChoiceInput';


// --- Main Component ---

interface QuestionFieldProps {
  question: Question;
  form: UseFormReturn; // Use specific form type if available, else 'any' or FieldValues
}

// Mapping from QuestionType to the specific input component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuestionInputComponents: Record<QuestionType, React.ComponentType<any>> = {
  [QuestionType.ShortText]: ShortTextInput,
  [QuestionType.Paragraph]: ParagraphInput,
  [QuestionType.Boolean]: BooleanInput,
  [QuestionType.Number]: NumberInput,
  [QuestionType.Phone]: PhoneInput,
  [QuestionType.Date]: DateInput,
  [QuestionType.Email]: EmailInput,
  [QuestionType.SingleChoice]: SingleChoiceInput,
  [QuestionType.MultipleChoice]: MultipleChoiceInput,
};

const QuestionField = React.memo(({ question, form }: QuestionFieldProps) => {
  // Memoize sorted options to avoid re-sorting on every render
  const sortedOptions = React.useMemo(() =>
    [...(question.options || [])].sort((a, b) => a.order - b.order),
    [question.options]
  );

  const InputComponent = QuestionInputComponents[question.type];

  // Render function for react-hook-form's FormField
  const renderFormField = ({ field }: { field: ControllerRenderProps<FieldValues, string> }) => {
    // Props needed by choice components
    const choiceProps = { options: sortedOptions };

    // Handle different layouts based on type
    switch (question.type) {
      case QuestionType.Boolean:
        // Special layout for Boolean (Switch)
        return (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <MemoizedFormLabel text={question.text} required={question.required} />
              {/* Optional: Add FormDescription here if needed */}
            </div>
            <FormControl>
              <InputComponent field={field} />
            </FormControl>
            <FormMessage /> {/* Display validation errors */}
          </FormItem>
        );

      case QuestionType.Date:
         // Date uses Popover, handled within its component, needs standard layout here
         return (
           <FormItem className="flex flex-col">
             <MemoizedFormLabel text={question.text} required={question.required} />
             {/* Popover trigger/content is inside DateInput */}
             <InputComponent field={field} />
             <FormMessage />
           </FormItem>
         );

      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice:
        // Layout for choice types
        return (
          <FormItem className={question.type === QuestionType.SingleChoice ? "space-y-3" : ""}>
            <MemoizedFormLabel text={question.text} required={question.required} />
            <FormControl>
              <InputComponent field={field} {...choiceProps} />
            </FormControl>
            <FormMessage />
          </FormItem>
        );

      // Default layout for simple inputs
      case QuestionType.ShortText:
      case QuestionType.Paragraph:
      case QuestionType.Number:
      case QuestionType.Phone:
      case QuestionType.Email:
        return (
          <FormItem>
            <MemoizedFormLabel text={question.text} required={question.required} />
            <FormControl>
              <InputComponent field={field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        );

      default:
        // Fallback for unsupported types
        // Use exhaustive check helper if possible in TypeScript setup
        console.warn("Unsupported question type encountered:", question.type);
        return (
          <div className="text-red-500">
            Неподдерживаемый тип вопроса: {question.type}
          </div>
        );
    }
  };

  if (!InputComponent) {
    // Handle case where type might not be in the enum/mapping correctly
     console.error("No component found for question type:", question.type);
     return (
       <div className="text-red-500 font-bold">
         Ошибка конфигурации: Не найден компонент для типа вопроса {question.type}
       </div>
     );
  }

  return (
    <FormField
      control={form.control}
      name={question.id}
      render={renderFormField}
    />
  );
});

QuestionField.displayName = 'QuestionField';

export default QuestionField;