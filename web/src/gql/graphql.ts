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
  forms: Array<Form>;
  me: User;
  ping: Ping;
};


export type QueryFormArgs = {
  id: Scalars['ID']['input'];
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

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, displayName: string, picture: string, googleId: string, isBanned: boolean } };


export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"picture"}},{"kind":"Field","name":{"kind":"Name","value":"googleId"}},{"kind":"Field","name":{"kind":"Name","value":"isBanned"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;