'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  useFieldArray,
  useForm,
  useWatch,
  Control,
  SubmitHandler,
  Resolver,
} from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateForm } from '@/src/api/createForm'; 
import { FormAccess, QuestionType, FormInput, QuestionInput, OptionInput } from '@/src/gql/graphql';
import { useEffect } from 'react';


const QUESTION_TYPES = {
  SHORT_TEXT: 'SHORT_TEXT',
  PARAGRAPH: 'PARAGRAPH',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
} as const;

type QuestionTypeValue = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];

const QUESTION_TYPE_LABELS: Record<QuestionTypeValue, string> = {
  [QUESTION_TYPES.SHORT_TEXT]: 'Короткий текст',
  [QUESTION_TYPES.PARAGRAPH]: 'Абзац',
  [QUESTION_TYPES.NUMBER]: 'Число',
  [QUESTION_TYPES.BOOLEAN]: 'Да/Нет (переключатель)',
  [QUESTION_TYPES.DATE]: 'Дата',
  [QUESTION_TYPES.EMAIL]: 'Email',
  [QUESTION_TYPES.PHONE]: 'Телефон',
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Один из списка',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Несколько из списка',
};

const ACCESS_TYPES = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  BY_LINK: 'BY_LINK',
} as const;

type AccessTypeValue = typeof ACCESS_TYPES[keyof typeof ACCESS_TYPES];

const ACCESS_TYPE_LABELS: Record<AccessTypeValue, string> = {
  [ACCESS_TYPES.PUBLIC]: 'Публичная',
  [ACCESS_TYPES.PRIVATE]: 'Приватная',
  [ACCESS_TYPES.BY_LINK]: 'По ссылке',
};


const mapClientTypeToApiType = (type: QuestionTypeValue): QuestionType => {
  const typeMap: Record<QuestionTypeValue, QuestionType> = {
    [QUESTION_TYPES.SHORT_TEXT]: QuestionType.ShortText,
    [QUESTION_TYPES.PARAGRAPH]: QuestionType.Paragraph,
    [QUESTION_TYPES.NUMBER]: QuestionType.Number,
    [QUESTION_TYPES.BOOLEAN]: QuestionType.Boolean,
    [QUESTION_TYPES.DATE]: QuestionType.Date,
    [QUESTION_TYPES.EMAIL]: QuestionType.Email,
    [QUESTION_TYPES.PHONE]: QuestionType.Phone,
    [QUESTION_TYPES.SINGLE_CHOICE]: QuestionType.SingleChoice,
    [QUESTION_TYPES.MULTIPLE_CHOICE]: QuestionType.MultipleChoice,
  };
  return typeMap[type] ?? QuestionType.ShortText; // Default fallback
};

const questionTypeHasOptions = (type: QuestionTypeValue | undefined): boolean => {
  return type === QUESTION_TYPES.SINGLE_CHOICE || type === QUESTION_TYPES.MULTIPLE_CHOICE;
};


const optionSchema = z.object({
  text: z.string().min(1, 'Текст варианта обязателен'),
});

const questionSchema = z.object({
  text: z.string().min(1, 'Текст вопроса обязателен'),
  type: z.nativeEnum(QUESTION_TYPES).default(QUESTION_TYPES.SHORT_TEXT),
  required: z.boolean().default(false),
  options: z.array(optionSchema).optional(),
});

const formSchema = z.object({
  title: z.string().min(1, 'Название формы обязательно'),
  description: z.string().optional(),
  access: z.nativeEnum(ACCESS_TYPES),
  questions: z.array(questionSchema).min(1, 'Добавьте хотя бы один вопрос'),
});

type FormValues = z.infer<typeof formSchema>;;

interface QuestionOptionsProps {
  questionIndex: number;
  control: Control<FormValues>;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({ questionIndex, control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const handleAddOption = () => {
    append({ text: '' });
  };

  return (
    <div className="space-y-2 mt-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <FormLabel>Варианты ответа</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Добавить вариант
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Добавьте хотя бы один вариант ответа.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((option, optionIndex) => (
          <div key={option.id} className="flex items-center gap-2">
            <FormField
              control={control}
              name={`questions.${questionIndex}.options.${optionIndex}.text`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={`Вариант ${optionIndex + 1}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(optionIndex)}
              className="text-destructive hover:text-destructive/90"
              aria-label="Удалить вариант"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface QuestionItemProps {
  index: number;
  control: Control<FormValues>;
  totalQuestions: number;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  fieldId: string; // For React key prop
}

const QuestionItem: React.FC<QuestionItemProps> = React.memo(({
  index,
  control,
  totalQuestions,
  onRemove,
  onMove,
  fieldId,
}) => {
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  const showOptions = questionTypeHasOptions(questionType);

  return (
    <Card key={fieldId} className="border border-muted">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {index + 1}
            </span>
            <CardTitle className="text-base">Вопрос {index + 1}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onMove(index, index - 1)}
                title="Переместить выше"
                aria-label="Переместить вопрос выше"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {index < totalQuestions - 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onMove(index, index + 1)}
                title="Переместить ниже"
                aria-label="Переместить вопрос ниже"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              disabled={totalQuestions <= 1}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              title="Удалить вопрос"
              aria-label="Удалить вопрос"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <FormField
          control={control}
          name={`questions.${index}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Текст вопроса</FormLabel>
              <FormControl>
                <Input placeholder="Введите вопрос..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип вопроса</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`questions.${index}.required`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-start sm:justify-end sm:items-end space-x-3 rounded-md h-full pb-1.5">
                 <FormLabel className="order-2">Обязательный вопрос</FormLabel>
                <FormControl className="order-1">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-labelledby={`required-label-${index}`}
                  />
                </FormControl>
                 <span id={`required-label-${index}`} className="sr-only">Обязательный вопрос</span>
              </FormItem>
            )}
          />
        </div>

        {showOptions && (
          <QuestionOptions questionIndex={index} control={control} />
        )}
      </CardContent>
    </Card>
  );
});
QuestionItem.displayName = 'QuestionItem';


export default function NewFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createForm, { error: mutationError }] = useCreateForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      title: '',
      description: '',
      access: ACCESS_TYPES.PUBLIC,
      questions: [
        {
          text: '',
          type: QUESTION_TYPES.SHORT_TEXT,
          required: false,
          options: [],
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const handleAddQuestion = React.useCallback(() => {
    append({
      text: '',
      type: QUESTION_TYPES.SHORT_TEXT,
      required: false,
      options: [],
    });
  }, [append]);

  const handleRemoveQuestion = React.useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.warning('Форма должна содержать хотя бы один вопрос.');
    }
  }, [fields.length, remove]);

  const handleMoveQuestion = React.useCallback((from: number, to: number) => {
    move(from, to);
  }, [move]);

  const onSubmit: SubmitHandler<FormValues> = React.useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      const formInput: FormInput = {
        title: data.title,
        description: data.description || '',
        access: data.access as FormAccess,
        questions: data.questions.map((q, index): QuestionInput => {
          const options: OptionInput[] = (questionTypeHasOptions(q.type) && q.options)
            ? q.options.map((opt, optIndex) => ({
                text: opt.text,
                order: optIndex,
              }))
            : [];

          return {
            text: q.text,
            type: mapClientTypeToApiType(q.type),
            required: q.required,
            order: index,
            options: options,
          };
        }),
      };
      
      const result = await createForm({
        variables: { input: formInput },
      });

      if (result.errors || !result.data?.createForm?.id) {
        const errorMessage = result.errors?.[0]?.message || 'Неизвестная ошибка GraphQL.';
        console.error('GraphQL Error creating form:', result.errors);
        toast.error(`Ошибка при создании формы: ${errorMessage}`);
      } else {
        toast.success('Форма успешно создана!');
        router.push(`/form/${result.data.createForm.id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Произошла ошибка при отправке формы. Проверьте соединение.');
    } finally {
      setIsSubmitting(false);
    }
  }, [createForm, router]);

  useEffect(() => {
    if (mutationError) {
      console.error('Mutation Hook Error:', mutationError);
      toast.error(`Ошибка операции: ${mutationError.message}`);
    }
  }, [mutationError]);

  return (
    <div className="container max-w-3xl py-8 mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className='flex flex-col gap-6'>
            <CardHeader>
              <CardTitle>Создание новой формы</CardTitle>
              <CardDescription>
                Заполните основную информацию и добавьте необходимые поля.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название формы</FormLabel>
                      <FormControl>
                        <Input placeholder="Введите название формы" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (необязательно)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Добавьте описание формы..."
                          className="resize-none"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Доступ к форме</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип доступа" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ACCESS_TYPE_LABELS).map(([value, label]) => (
                             <SelectItem key={value} value={value}>
                               {label}
                             </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Публичные формы видны всем, приватные - только вам.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Вопросы</h3>
                {fields.map((field, index) => (
                  <QuestionItem
                    key={field.id}
                    fieldId={field.id}
                    index={index}
                    control={form.control}
                    totalQuestions={fields.length}
                    onRemove={handleRemoveQuestion}
                    onMove={handleMoveQuestion}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleAddQuestion}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Добавить вопрос
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать форму'
                )}
              </Button>
            </CardFooter>
          </div>
        </form>
      </Form>
    </div>
  );
}