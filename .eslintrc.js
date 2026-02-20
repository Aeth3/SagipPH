module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['package/src/domain/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '**/infra',
                  '**/infra/**',
                  '**/data',
                  '**/data/**',
                  '**/presentation',
                  '**/presentation/**',
                  '**/features',
                  '**/features/**',
                  '**/composition',
                  '**/composition/**',
                  '**/api',
                  '**/api/**',
                  '**/services',
                  '**/services/**',
                  '**/legacyApp',
                  '**/legacyApp/**',
                  'package/src/infra',
                  'package/src/infra/**',
                  'package/src/data',
                  'package/src/data/**',
                  'package/src/presentation',
                  'package/src/presentation/**',
                  'package/src/features',
                  'package/src/features/**',
                  'package/src/composition',
                  'package/src/composition/**',
                  'package/src/api',
                  'package/src/api/**',
                  'package/src/services',
                  'package/src/services/**',
                  'package/src/legacyApp',
                  'package/src/legacyApp/**'
                ],
                message: 'Domain must not depend on outer layers (data/infra/presentation/features/composition/api/services).'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['package/src/composition/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '**/features',
                  '**/features/**',
                  '**/presentation',
                  '**/presentation/**',
                  '**/legacyApp',
                  '**/legacyApp/**',
                  'package/src/features',
                  'package/src/features/**',
                  'package/src/presentation',
                  'package/src/presentation/**',
                  'package/src/legacyApp',
                  'package/src/legacyApp/**'
                ],
                message: 'Composition is an application boundary; it should not import UI or legacy layers.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['package/src/features/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: [
                  '**/data/datasources',
                  '**/data/datasources/**',
                  '**/data/repositories',
                  '**/data/repositories/**',
                  '**/infra',
                  '**/infra/**',
                  '**/api',
                  '**/api/**',
                  '**/services',
                  '**/services/**',
                  '**/legacyApp',
                  '**/legacyApp/**',
                  'package/src/data/datasources',
                  'package/src/data/datasources/**',
                  'package/src/data/repositories',
                  'package/src/data/repositories/**',
                  'package/src/infra',
                  'package/src/infra/**',
                  'package/src/api',
                  'package/src/api/**',
                  'package/src/services',
                  'package/src/services/**',
                  'package/src/legacyApp',
                  'package/src/legacyApp/**'
                ],
                message: 'Features should call use cases/composition instead of infra/data/services directly.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['package/src/presentation/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: [
                  '**/data/datasources',
                  '**/data/datasources/**',
                  '**/data/repositories',
                  '**/data/repositories/**',
                  '**/infra',
                  '**/infra/**',
                  '**/api',
                  '**/api/**',
                  '**/services',
                  '**/services/**',
                  '**/legacyApp',
                  '**/legacyApp/**',
                  'package/src/data/datasources',
                  'package/src/data/datasources/**',
                  'package/src/data/repositories',
                  'package/src/data/repositories/**',
                  'package/src/infra',
                  'package/src/infra/**',
                  'package/src/api',
                  'package/src/api/**',
                  'package/src/services',
                  'package/src/services/**',
                  'package/src/legacyApp',
                  'package/src/legacyApp/**'
                ],
                message: 'Presentation should stay UI-focused and depend on composition/use cases, not infra/data/services.'
              }
            ]
          }
        ]
      }
    }
  ]
};
