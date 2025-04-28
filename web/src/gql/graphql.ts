/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Answer = {
  __typename?: 'Answer';
  boolValue?: Maybe<Scalars['Boolean']['output']>;
  dateValue?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  numberValue?: Maybe<Scalars['Float']['output']>;
  question?: Maybe<Question>;
  questionId: Scalars['ID']['output'];
  selectedOptions?: Maybe<Array<Option>>;
  textValue?: Maybe<Scalars['String']['output']>;
};

export type AnswerInput = {
  boolValue?: InputMaybe<Scalars['Boolean']['input']>;
  dateValue?: InputMaybe<Scalars['String']['input']>;
  numberValue?: InputMaybe<Scalars['Float']['input']>;
  optionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  questionId: Scalars['ID']['input'];
  textValue?: InputMaybe<Scalars['String']['input']>;
};

export type Form = {
  __typename?: 'Form';
  access: FormAccess;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ownerId: Scalars['ID']['output'];
  questions?: Maybe<Array<Question>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum FormAccess {
  ByLink = 'BY_LINK',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type FormInput = {
  access?: InputMaybe<FormAccess>;
  description?: InputMaybe<Scalars['String']['input']>;
  questions?: InputMaybe<Array<QuestionInput>>;
  title: Scalars['String']['input'];
};

export type FormResponse = {
  __typename?: 'FormResponse';
  answers: Array<Answer>;
  createdAt: Scalars['String']['output'];
  form?: Maybe<Form>;
  formId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
};

export type FormResponseInput = {
  answers: Array<AnswerInput>;
  formId: Scalars['ID']['input'];
};

export type FormUpdateInput = {
  access?: InputMaybe<FormAccess>;
  description?: InputMaybe<Scalars['String']['input']>;
  questions?: InputMaybe<Array<QuestionInput>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createForm: Form;
  deleteForm: Scalars['Boolean']['output'];
  deleteOption: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  submitFormResponse: FormResponse;
  updateForm: Form;
  updateOption: Option;
  updateQuestion: Question;
};


export type MutationCreateFormArgs = {
  input: FormInput;
};


export type MutationDeleteFormArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOptionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSubmitFormResponseArgs = {
  input: FormResponseInput;
};


export type MutationUpdateFormArgs = {
  id: Scalars['ID']['input'];
  input: FormUpdateInput;
};


export type MutationUpdateOptionArgs = {
  id: Scalars['ID']['input'];
  input: OptionUpdateInput;
};


export type MutationUpdateQuestionArgs = {
  id: Scalars['ID']['input'];
  input: QuestionUpdateInput;
};

export type Option = {
  __typename?: 'Option';
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  questionId: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type OptionInput = {
  order: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type OptionUpdateInput = {
  order?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type Ping = {
  __typename?: 'Ping';
  message: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  form?: Maybe<Form>;
  formResponse?: Maybe<FormResponse>;
  formResponses: Array<FormResponse>;
  forms: Array<Form>;
  me: User;
  ping: Ping;
};


export type QueryFormArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFormResponseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFormResponsesArgs = {
  formId: Scalars['ID']['input'];
};


export type QueryFormsArgs = {
  access?: InputMaybe<FormAccess>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
};

export type Question = {
  __typename?: 'Question';
  formId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  options?: Maybe<Array<Option>>;
  order: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  text: Scalars['String']['output'];
  type: QuestionType;
};

export type QuestionInput = {
  options?: InputMaybe<Array<OptionInput>>;
  order: Scalars['Int']['input'];
  required: Scalars['Boolean']['input'];
  text: Scalars['String']['input'];
  type: QuestionType;
};

export enum QuestionType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Email = 'EMAIL',
  MultipleChoice = 'MULTIPLE_CHOICE',
  Number = 'NUMBER',
  Paragraph = 'PARAGRAPH',
  Phone = 'PHONE',
  ShortText = 'SHORT_TEXT',
  SingleChoice = 'SINGLE_CHOICE'
}

export type QuestionUpdateInput = {
  options?: InputMaybe<Array<OptionInput>>;
  order?: InputMaybe<Scalars['Int']['input']>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<QuestionType>;
};

export type User = {
  __typename?: 'User';
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  forms: Array<Form>;
  googleId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isBanned: Scalars['Boolean']['output'];
  picture: Scalars['String']['output'];
};

export type SubmitFormResponseMutationVariables = Exact<{
  input: FormResponseInput;
}>;


export type SubmitFormResponseMutation = { __typename?: 'Mutation', submitFormResponse: { __typename?: 'FormResponse', id: string, formId: string, createdAt: string } };

export type GetFormResponsesQueryVariables = Exact<{
  formId: Scalars['ID']['input'];
}>;


export type GetFormResponsesQuery = { __typename?: 'Query', formResponses: Array<{ __typename?: 'FormResponse', id: string, formId: string, createdAt: string, answers: Array<{ __typename?: 'Answer', id: string, questionId: string, textValue?: string | null, boolValue?: boolean | null, numberValue?: number | null, dateValue?: string | null, selectedOptions?: Array<{ __typename?: 'Option', id: string, text: string }> | null }> }> };

export type GetFormQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFormQuery = { __typename?: 'Query', form?: { __typename?: 'Form', id: string, title: string, description: string, ownerId: string, access: FormAccess, createdAt: string, updatedAt: string, questions?: Array<{ __typename?: 'Question', id: string, text: string, type: QuestionType, required: boolean, order: number, options?: Array<{ __typename?: 'Option', id: string, text: string, order: number }> | null }> | null } | null };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, displayName: string, picture: string, googleId: string, isBanned: boolean } };


export const SubmitFormResponseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitFormResponse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FormResponseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitFormResponse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"formId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<SubmitFormResponseMutation, SubmitFormResponseMutationVariables>;
export const GetFormResponsesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFormResponses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"formId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"formResponses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"formId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"formId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"formId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"questionId"}},{"kind":"Field","name":{"kind":"Name","value":"textValue"}},{"kind":"Field","name":{"kind":"Name","value":"boolValue"}},{"kind":"Field","name":{"kind":"Name","value":"numberValue"}},{"kind":"Field","name":{"kind":"Name","value":"dateValue"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFormResponsesQuery, GetFormResponsesQueryVariables>;
export const GetFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"form"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"ownerId"}},{"kind":"Field","name":{"kind":"Name","value":"access"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetFormQuery, GetFormQueryVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"picture"}},{"kind":"Field","name":{"kind":"Name","value":"googleId"}},{"kind":"Field","name":{"kind":"Name","value":"isBanned"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;