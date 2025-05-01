'use client';

import React, { useMemo, useCallback, memo } from "react";
import { Form as GQLForm, Question, QuestionType } from "@/src/gql/graphql";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn, SubmitHandler } from "react-hook-form";
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as z from "zod";
import QuestionField from "./question-field/question-field";
import { useFormSubmission } from "./useFormSubmission";
import { useGetFormById } from "@/src/api/getForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormViewProps {
  formId: string;
}

const REQUIRED_FIELD_MESSAGE = "Это поле обязательно для заполнения";
const INVALID_EMAIL_MESSAGE = "Введите корректный email адрес";
const INVALID_PHONE_MESSAGE = "Введите корректный номер телефона";
const INVALID_NUMBER_MESSAGE = "Введите число";
const INVALID_DATE_MESSAGE = "Выберите корректную дату";
const MIN_CHOICE_MESSAGE = "Выберите хотя бы один вариант";

type ZodSchemaShape = Record<string, z.ZodTypeAny>;

/**
 * Builds a Zod schema dynamically based on the form questions.
 */
const buildFormSchema = (questions: ReadonlyArray<Question> | null | undefined): z.ZodObject<ZodSchemaShape, "strip", z.ZodTypeAny, z.ZodRawShape, z.ZodRawShape> => {
  if (!questions || questions.length === 0) {
    // Return an empty object schema if there are no questions
    return z.object({});
  }

  const schemaShape = questions.reduce<ZodSchemaShape>((schema, question) => {
    let fieldSchema: z.ZodTypeAny; // Base type

    switch (question.type) {
      case QuestionType.ShortText:
      case QuestionType.Paragraph:
        fieldSchema = z.string();
        break;
      case QuestionType.Email:
        fieldSchema = z.string().email(INVALID_EMAIL_MESSAGE);
        break;
      case QuestionType.Phone:
        fieldSchema = z.string().refine(
          (value) => !value || isValidPhoneNumber(value), // Allow empty string if not required
          { message: INVALID_PHONE_MESSAGE }
        );
        break;
      case QuestionType.Number:
        // Preprocess to handle empty strings before coercing to number
        fieldSchema = z.preprocess(
          (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
          z.number({ invalid_type_error: INVALID_NUMBER_MESSAGE })
        );
        break;
      case QuestionType.SingleChoice:
        // Ensure it's a string, could refine based on actual choice values if needed
        fieldSchema = z.string();
        break;
      case QuestionType.MultipleChoice:
        // Expect an array of strings (choice IDs/values)
        fieldSchema = z.array(z.string()); // Make nonempty check conditional on 'required'
        break;
      case QuestionType.Date:
         // Validate date string format (ISO 8601 or similar expected by Date.parse)
         fieldSchema = z.string().refine((val) => !val || !isNaN(Date.parse(val)), { // Allow empty string if not required
           message: INVALID_DATE_MESSAGE,
         });
        break;
      case QuestionType.Boolean:
         fieldSchema = z.boolean();
         break;
      default:
        // Using z.any() here as a pragmatic fallback for now.
        console.warn(`Unsupported question type for schema generation: ${question.type}`);
        fieldSchema = z.any();
    }

    // Apply required validation if the question mandates it
    if (question.required) {
        if (fieldSchema instanceof z.ZodString) {
            // Chain min(1) for required strings AFTER specific format validation
            fieldSchema = fieldSchema.min(1, REQUIRED_FIELD_MESSAGE);
        } else if (fieldSchema instanceof z.ZodArray) {
            // Apply nonempty check specifically for required multiple choice
            fieldSchema = fieldSchema.nonempty(MIN_CHOICE_MESSAGE);
        } else if (
            fieldSchema instanceof z.ZodNumber ||
            (fieldSchema instanceof z.ZodEffects && fieldSchema._def.schema instanceof z.ZodNumber) // Handle preprocessed numbers
        ) {
            // For numbers, refine to ensure a value is actually entered
             fieldSchema = fieldSchema.refine(val => val !== undefined && val !== null && !isNaN(val), {
                 message: REQUIRED_FIELD_MESSAGE,
             });
        } else if (fieldSchema instanceof z.ZodBoolean) {
             // Booleans are typically required to be explicitly true or false if required
             // No extra check needed as zod boolean handles this.
        } else if (fieldSchema instanceof z.ZodAny) {
             // If we fell back to z.any(), add a basic check
             fieldSchema = fieldSchema.refine(val => val !== null && val !== undefined && val !== '', {
                 message: REQUIRED_FIELD_MESSAGE,
             });
        }
        // Note: SingleChoice (string) and Date (string) are covered by ZodString.min(1)
    } else {
      // Make field optional and nullable if not required
      fieldSchema = fieldSchema.optional().nullable();
    }

    schema[question.id] = fieldSchema;
    return schema;
  }, {});

  return z.object(schemaShape);
};

// --- Default Values ---

// Define a type for the default values object
type FormDefaultValues = Record<string, string | number | boolean | string[] | undefined | null>;


/**
 * Builds the default values object for the form based on question types.
 */
const buildDefaultValues = (questions: ReadonlyArray<Question> | null | undefined): FormDefaultValues => {
   if (!questions) {
     return {};
   }
  return questions.reduce<FormDefaultValues>((values, question) => {
    let defaultValue: string | number | boolean | string[] | undefined | null;
    switch (question.type) {
      case QuestionType.Boolean:
        defaultValue = false; // Default to false for checkboxes
        break;
      case QuestionType.MultipleChoice:
        defaultValue = []; // Default to empty array
        break;
      case QuestionType.ShortText:
      case QuestionType.Paragraph:
      case QuestionType.Email:
      case QuestionType.Phone:
      case QuestionType.SingleChoice:
      case QuestionType.Date:
        defaultValue = ''; // Default strings to empty for controlled inputs
        break;
      case QuestionType.Number:
        defaultValue = undefined; // Let placeholder/input handle number hint
        break;
      default:
        defaultValue = undefined; // Default for unknown types
    }
    values[question.id] = defaultValue;
    return values;
  }, {});
};

const FormSkeleton = memo(() => (
  <div className="container max-w-3xl animate-pulse">
    <div>
      <div className="space-y-3 py-4">
        <Skeleton className="h-8 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full my-6 bg-gray-200" />
      <div className="space-y-8 pt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-1/2 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
));
FormSkeleton.displayName = 'FormSkeleton';

// --- Error Display ---
interface FormErrorProps {
    error: Error;
}

export const FormErrorDisplay = memo(({ error }: FormErrorProps) => (
    <div className="container max-w-3xl flex justify-center flex-col gap-1.5">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка загрузки</AlertTitle>
            <AlertDescription>
                Не удалось загрузить данные. Пожалуйста, попробуйте обновить страницу или свяжитесь с поддержкой.
                {process.env.NODE_ENV === 'development' && <pre className="mt-2 text-xs">{error.message}</pre>}
            </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.pathname = '/'} variant="link">На главную страницу</Button>
    </div>
));
FormErrorDisplay.displayName = 'FormErrorDisplay';

interface FormSuccessProps {
    title?: string | null;
}
const FormSuccessDisplay = memo(({ title }: FormSuccessProps) => (
    <div className="container max-w-3xl">
        <div>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Спасибо!</CardTitle>
                <CardDescription>
                Ваши ответы для формы {title || 'Форма'} были успешно отправлены.
                </CardDescription>
            </CardHeader>
        </div>
    </div>
));
FormSuccessDisplay.displayName = 'FormSuccessDisplay';


export default function FormView({ formId }: FormViewProps) {
  const { data, error, loading } = useGetFormById(formId);

  // Use optional chaining and nullish coalescing for safer access
  // Ensure questions is always an array (potentially empty) for easier handling downstream
  const gqlForm: GQLForm | null = useMemo(() => data?.form ?? ({} as GQLForm), [data]);
  const questions: ReadonlyArray<Question> = useMemo(() => gqlForm?.questions ?? [], [gqlForm]);

  // Memoize schema and default values based on the questions array
  // Pass the potentially empty but defined questions array
  const formSchema = useMemo(() => buildFormSchema(questions), [questions]);
  const defaultValues = useMemo(() => buildDefaultValues(questions), [questions]);

  // Infer the type of the form values from the generated schema
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as Partial<FormValues>, // Cast needed because buildDefaultValues returns a wider type than Zod infers initially
    mode: 'onBlur', // Validate on blur
  });


  // Memoize sorted questions - ensure sorting happens only when questions change
  const sortedQuestions = useMemo(() =>
    [...questions].sort((a, b) => a.order - b.order),
    [questions]
  );

  // Pass the potentially null gqlForm to the hook.
  // The hook itself MUST handle the null case internally to prevent crashes.
  const { submitForm, isSubmitting, submitted } = useFormSubmission({ form: gqlForm });

  // Use useCallback for the submit handler to prevent unnecessary re-renders
  const onSubmit: SubmitHandler<FormValues> = useCallback(
      async (values) => {
          if (gqlForm) {
              //@ts-expect-error just ignore
              await submitForm(values);
          } else {
              console.error("Form data is not available for submission.");
          }
      },
      [submitForm, gqlForm] 
  );

  if (loading) {
    return <FormSkeleton />;
  }

  // Handle fetch error OR case where form data is unexpectedly null
  if (error || !gqlForm) {
    return <FormErrorDisplay error={error || new Error("Данные формы не найдены.")} />;
  }

  // Show success message after submission
  if (submitted) {
    return <FormSuccessDisplay title={gqlForm.title} />;
  }

  // Render the main form
  return (
    <div className="container max-w-3xl">
      <div>
        <CardHeader>
          <CardTitle className="text-2xl">{gqlForm.title}</CardTitle>
          {gqlForm.description && (
            <CardDescription>{gqlForm.description}</CardDescription>
          )}
        </CardHeader>
        <Separator className="my-6" />
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {sortedQuestions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  form={form as UseFormReturn}
                />
              ))}
              <CardFooter className="flex justify-end px-0 pt-6">
                <Button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isValid}
                >
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