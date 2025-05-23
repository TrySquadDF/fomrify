import { join, resolve } from 'node:path'
import process from 'node:process'

import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaDir = resolve(join(process.cwd(), '..', 'apps', 'api-gql', 'internal', 'delivery', 'gql', 'schema', '*.graphqls'))

const config: CodegenConfig = {
	config: {
		scalars: {
			Upload: 'File',
		},
	},
	schema: schemaDir,
	documents: ['src/**/*.{tsx,ts}'],
	ignoreNoDocuments: true,
	generates: {
		'./src/gql/': {
			preset: 'client',
			config: {
				useTypeImports: true,
			},
		},
	},
}

export default config