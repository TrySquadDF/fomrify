/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation SubmitFormResponse($input: FormResponseInput!) {\n    submitFormResponse(input: $input) {\n      id\n      formId\n      createdAt\n    }\n  }\n": typeof types.SubmitFormResponseDocument,
    "\n    query GetFormResponses($formId: ID!) {\n        formResponses(formId: $formId) {\n            id\n            formId\n            createdAt\n            answers {\n                id\n                questionId\n                textValue\n                boolValue\n                numberValue\n                dateValue\n                selectedOptions {\n                    id\n                    text\n                }\n            }\n        }\n    }\n": typeof types.GetFormResponsesDocument,
    "\n        query GetForm($id: ID!) {\n            form(id: $id) {\n                id\n                title\n                description\n                ownerId\n                access\n                createdAt\n                updatedAt\n                questions {\n                    id\n                    text\n                    type\n                    required\n                    order\n                    options {\n                        id\n                        text\n                        order\n                    }\n                }\n            }\n        }\n": typeof types.GetFormDocument,
    "\n    query GetMe {\n        me {\n            id\n            email\n            displayName\n            picture\n            googleId\n            isBanned\n        }\n    }\n": typeof types.GetMeDocument,
};
const documents: Documents = {
    "\n  mutation SubmitFormResponse($input: FormResponseInput!) {\n    submitFormResponse(input: $input) {\n      id\n      formId\n      createdAt\n    }\n  }\n": types.SubmitFormResponseDocument,
    "\n    query GetFormResponses($formId: ID!) {\n        formResponses(formId: $formId) {\n            id\n            formId\n            createdAt\n            answers {\n                id\n                questionId\n                textValue\n                boolValue\n                numberValue\n                dateValue\n                selectedOptions {\n                    id\n                    text\n                }\n            }\n        }\n    }\n": types.GetFormResponsesDocument,
    "\n        query GetForm($id: ID!) {\n            form(id: $id) {\n                id\n                title\n                description\n                ownerId\n                access\n                createdAt\n                updatedAt\n                questions {\n                    id\n                    text\n                    type\n                    required\n                    order\n                    options {\n                        id\n                        text\n                        order\n                    }\n                }\n            }\n        }\n": types.GetFormDocument,
    "\n    query GetMe {\n        me {\n            id\n            email\n            displayName\n            picture\n            googleId\n            isBanned\n        }\n    }\n": types.GetMeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitFormResponse($input: FormResponseInput!) {\n    submitFormResponse(input: $input) {\n      id\n      formId\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitFormResponse($input: FormResponseInput!) {\n    submitFormResponse(input: $input) {\n      id\n      formId\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetFormResponses($formId: ID!) {\n        formResponses(formId: $formId) {\n            id\n            formId\n            createdAt\n            answers {\n                id\n                questionId\n                textValue\n                boolValue\n                numberValue\n                dateValue\n                selectedOptions {\n                    id\n                    text\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GetFormResponses($formId: ID!) {\n        formResponses(formId: $formId) {\n            id\n            formId\n            createdAt\n            answers {\n                id\n                questionId\n                textValue\n                boolValue\n                numberValue\n                dateValue\n                selectedOptions {\n                    id\n                    text\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n        query GetForm($id: ID!) {\n            form(id: $id) {\n                id\n                title\n                description\n                ownerId\n                access\n                createdAt\n                updatedAt\n                questions {\n                    id\n                    text\n                    type\n                    required\n                    order\n                    options {\n                        id\n                        text\n                        order\n                    }\n                }\n            }\n        }\n"): (typeof documents)["\n        query GetForm($id: ID!) {\n            form(id: $id) {\n                id\n                title\n                description\n                ownerId\n                access\n                createdAt\n                updatedAt\n                questions {\n                    id\n                    text\n                    type\n                    required\n                    order\n                    options {\n                        id\n                        text\n                        order\n                    }\n                }\n            }\n        }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GetMe {\n        me {\n            id\n            email\n            displayName\n            picture\n            googleId\n            isBanned\n        }\n    }\n"): (typeof documents)["\n    query GetMe {\n        me {\n            id\n            email\n            displayName\n            picture\n            googleId\n            isBanned\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;