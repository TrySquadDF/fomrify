import { useSubmitFormResponse } from "@/src/api/SubmitFormResponse";
import { Form, QuestionType } from "@/src/gql/graphql";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// Типы для разных видов значений вопросов
type TextValue = string;
type BooleanValue = boolean;
type NumberValue = number | string; // string для ввода, number после парсинга
type DateValue = string; // ISO date string
type SingleChoiceValue = string; // ID опции
type MultiChoiceValue = string[]; // массив ID опций

export type QuestionValue = 
  | TextValue 
  | BooleanValue 
  | NumberValue 
  | DateValue 
  | SingleChoiceValue 
  | MultiChoiceValue;

type FormValues = Record<string, QuestionValue>;

interface AnswerInput {
  questionId: string;
  textValue?: string;
  boolValue?: boolean;
  numberValue?: number;
  dateValue?: string;
  optionIds?: string[];
}

interface UseFormSubmissionParams {
  form: Form;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Хук для отправки формы
 * 
 * @param params Параметры хука
 * @returns объект с функциями и состоянием для отправки формы
 */
export function useFormSubmission({ form, onSuccess, onError }: UseFormSubmissionParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitFormResponse] = useSubmitFormResponse();

  const transformFormValues = useCallback((values: FormValues): AnswerInput[] => {
    return Object.entries(values).map(([questionId, value]) => {
      const question = form.questions?.find(q => q.id === questionId);
      if (!question) return null;
      
      const answer: AnswerInput = { questionId };
      
      switch (question.type) {
        case QuestionType.ShortText:
        case QuestionType.Paragraph:
        case QuestionType.Email:
        case QuestionType.Phone:
          answer.textValue = value as TextValue;
          break;
        case QuestionType.Boolean:
          answer.boolValue = value as BooleanValue;
          break;
        case QuestionType.Number:
          answer.numberValue = typeof value === 'string' 
            ? parseFloat(value) 
            : value as number;
          break;
        case QuestionType.Date:
          answer.dateValue = value as DateValue;
          break;
        case QuestionType.SingleChoice:
          answer.optionIds = [value as SingleChoiceValue];
          break;
        case QuestionType.MultipleChoice:
          answer.optionIds = value as MultiChoiceValue;
          break;
      }
      
      return answer;
    }).filter((answer): answer is AnswerInput => answer !== null);
  },
      [form.questions]);

  const submitForm = useCallback(async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Преобразуем значения в формат API
      const answers = transformFormValues(values);
      
      console.log('Sending form data:', answers);
      
      // Отправляем на сервер
      const { data } = await submitFormResponse({
        variables: {
          input: {
            formId: form.id,
            answers
          }
        }
      });
      
      setSubmitted(true);
      toast.success("Форма успешно отправлена!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      return data;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Ошибка при отправке формы. Пожалуйста, попробуйте еще раз.");
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  },
      [form.id, transformFormValues, submitFormResponse, onSuccess, onError]);

  const resetSubmission = useCallback(() => {
    setSubmitted(false);
  }, []);

  return {
    submitForm,
    isSubmitting,
    submitted,
    resetSubmission
  };
}