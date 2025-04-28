import { useSubmitFormResponse } from "@/src/api/SubmitFormResponse";
import { Form, QuestionType } from "@/src/gql/graphql";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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
  
    /**
     * Преобразует значения формы в формат API
     */
    const transformFormValues = useCallback((values: Record<string, any>) => {
      return Object.entries(values).map(([questionId, value]) => {
        // Найдем вопрос чтобы определить его тип
        const question = form.questions?.find(q => q.id === questionId);
        if (!question) return null;
        
        const answer: any = { questionId };
        
        // Подготовим значение в зависимости от типа вопроса
        switch (question.type) {
          case QuestionType.ShortText:
          case QuestionType.Paragraph:
          case QuestionType.Email:
          case QuestionType.Phone:
            answer.textValue = value as string;
            break;
          case QuestionType.Boolean:
            answer.boolValue = value as boolean;
            break;
          case QuestionType.Number:
            answer.numberValue = parseFloat(value as string);
            break;
          case QuestionType.Date:
            answer.dateValue = value as string; // ISO date string
            break;
          case QuestionType.SingleChoice:
            answer.optionIds = [value as string]; // ID выбранной опции
            break;
          case QuestionType.MultipleChoice:
            answer.optionIds = value as string[]; // Массив ID опций
            break;
        }
        
        return answer;
      }).filter(Boolean);
    }, [form.questions]);
  
    /**
     * Отправляет данные формы на сервер
     */
    const submitForm = useCallback(async (values: Record<string, any>) => {
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
    }, [form.id, transformFormValues, submitFormResponse, onSuccess, onError]);
  
    /**
     * Сбрасывает состояние отправки формы
     */
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