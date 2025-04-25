'use client';

import { Form as GQLForm, Question, QuestionType } from "@/src/gql/graphql";
import React, { useState, useMemo, useCallback } from "react"; 
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { isValidPhoneNumber } from 'react-phone-number-input'; 
import * as z from "zod";
import { toast } from "sonner";
import QuestionField from "./question-field/question-field";

interface FormViewProps {
  form: GQLForm;
}

/**
 * Builds a Zod schema dynamically based on the form questions.
 */
const buildFormSchema = (questions: Question[] | null | undefined) => {
  if (!questions) {
    return z.object({});
  }

  const schemaShape = questions.reduce((schema, question) => {
    let fieldSchema: z.ZodTypeAny = z.any(); // Default to any

    // Define base schema based on type
    switch (question.type) {
      case QuestionType.ShortText:
      case QuestionType.Paragraph:
        fieldSchema = z.string();
        break;
      // highlight-start
      case QuestionType.Email:
        // Add email validation
        fieldSchema = z.string().email("Введите корректный email адрес");
        break;
      case QuestionType.Phone:
        fieldSchema = z.string().refine(
          (value) => !value || isValidPhoneNumber(value), // Allow empty string OR valid phone number
          { message: "Введите корректный номер телефона" }
        );
        break;
      // highlight-end
      case QuestionType.Number:
        // Ensure coercion to number, handle invalid input
        fieldSchema = z.preprocess(
          (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
          z.number({ invalid_type_error: "Введите число" })
        );
        break;
      case QuestionType.SingleChoice:
        fieldSchema = z.string();
        break;
      case QuestionType.MultipleChoice:
        fieldSchema = z.array(z.string());
        break;
      case QuestionType.Date:
        // Store as ISO string, validate if it's a valid date string
         fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
           message: "Выберите корректную дату",
         });
        break;
      case QuestionType.Boolean:
         fieldSchema = z.boolean();
         break;
      default:
        // Keep z.any() for unsupported types, maybe log a warning
        console.warn(`Unsupported question type for schema generation: ${question.type}`);
        fieldSchema = z.any();
    }

    // Apply required validation
    if (question.required) {
      if (fieldSchema instanceof z.ZodString) {
        // Ensure specific messages for required fields that also have format validation
        const baseCheck = fieldSchema.min(1, "Это поле обязательно для заполнения");
        // Re-apply format validation if it exists, otherwise just use the min(1) check
        if (question.type === QuestionType.Email) {
            fieldSchema = baseCheck.email("Введите корректный email адрес");
        } else if (question.type === QuestionType.Phone) {
            fieldSchema = z.string().refine(
              (value) => !value || isValidPhoneNumber(value), // Allow empty string OR valid phone number
              { message: "Укажите корректный номер телефона" }
            )
        } else {
            fieldSchema = baseCheck;
        }
      } else if (fieldSchema instanceof z.ZodArray) {
        fieldSchema = fieldSchema.min(1, "Выберите хотя бы один вариант");
      } else if (fieldSchema instanceof z.ZodNumber || fieldSchema instanceof z.ZodBoolean || fieldSchema instanceof z.ZodDate || (fieldSchema instanceof z.ZodEffects && fieldSchema._def.schema instanceof z.ZodNumber)) {
         // For non-string/array types that can be intrinsically required
         fieldSchema = fieldSchema.refine(val => val !== null && val !== undefined, {
            message: "Это поле обязательно для заполнения",
         });
      } else {
         // Fallback for other types if necessary
         fieldSchema = fieldSchema.refine(val => val !== null && val !== undefined && val !== '', {
            message: "Это поле обязательно для заполнения",
         });
      }
    } else {
      // Make field optional if not required
      fieldSchema = fieldSchema.optional().nullable(); // Allow null/undefined for optional fields
    }

    return { ...schema, [question.id]: fieldSchema };
  }, {} as Record<string, z.ZodTypeAny>); // Explicit type for accumulator

  return z.object(schemaShape);
};

/**
 * Builds the default values object for the form.
 */
const buildDefaultValues = (questions: Question[] | null | undefined) => {
   if (!questions) {
     return {};
   }
  return questions.reduce((values, question) => {
    switch (question.type) {
      case QuestionType.Boolean:
        values[question.id] = false; // Default boolean to false
        break;
      case QuestionType.MultipleChoice:
        values[question.id] = []; // Default multiple choice to empty array
        break;
      case QuestionType.ShortText:
      case QuestionType.Paragraph:
      case QuestionType.Email:
      case QuestionType.Phone:
        values[question.id] = ""; // Default text inputs to empty string
        break;
      case QuestionType.Number:
      case QuestionType.Date:
      case QuestionType.SingleChoice:
      default:
        // Default others to undefined to let placeholder/initial state handle it
        values[question.id] = undefined;
    }
    return values;
  }, {} as Record<string, unknown>); // Use a more specific type if possible based on expected values
};

export default function FormView({ form: formData }: FormViewProps) { // Rename prop to avoid conflict
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Memoize schema and default values generation
  const formSchema = useMemo(() => buildFormSchema(formData.questions), [formData.questions]);
  const defaultValues = useMemo(() => buildDefaultValues(formData.questions), [formData.questions]);

  // Type the form hook correctly
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: 'onBlur', // Consider validation mode
  });

  // Memoize sorted questions
  const sortedQuestions = useMemo(() =>
    [...(formData.questions || [])].sort((a, b) => a.order - b.order),
    [formData.questions]
  );

  // Use useCallback for the submit handler
  const onSubmit = useCallback(async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Form data:', values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      setSubmitted(true);
      toast.success("Форма успешно отправлена!");
      form.reset(); // Optionally reset form after successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
      // Provide more specific error feedback if possible
      toast.error("Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form]); // Add form dependency for form.reset()

  // Render success state
  if (submitted) {
    return (
      <div className="container max-w-3xl">
        <div>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Спасибо за заполнение формы!</CardTitle>
            <CardDescription className="text-center">
              Ваши ответы были успешно отправлены.
            </CardDescription>
          </CardHeader>
        </div>
      </div>
    );
  }

  // Render form
  return (
    <div className="container max-w-3xl">
      <div >
        <CardHeader>
          <CardTitle className="text-2xl">{formData.title}</CardTitle>
          {formData.description && (
            <CardDescription>{formData.description}</CardDescription>
          )}
        </CardHeader>
        <Separator className="my-6" />
        <CardContent className="pt-6">
          {/* Pass the correctly typed form object */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {sortedQuestions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  form={form as UseFormReturn} // Cast form type if QuestionField expects a less specific type
                />
              ))}
              <CardFooter className="flex justify-end px-0 pt-4"> {/* Use flex justify-end */}
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} > {/* Disable if not dirty */}
                  {isSubmitting ? "Отправка..." : "Отправить"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </div>
    </div>
  );
}