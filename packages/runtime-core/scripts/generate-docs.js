import { z } from 'zod';

export const schema = z.object({
  canonicalReference: z.string(),
  docComment: z.string(),
  kind: z.string(),
  members: z.array(
    z.object({
      canonicalReference: z.string(),
      kind: z.string(),
      members: z.array(
        z.union([
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(
              z.union([
                z.object({ kind: z.string(), text: z.string() }),
                z.object({
                  canonicalReference: z.string(),
                  kind: z.string(),
                  text: z.string()
                })
              ])
            ),
            fileUrlPath: z.string(),
            kind: z.string(),
            name: z.string(),
            releaseTag: z.string(),
            typeTokenRange: z.object({
              endIndex: z.number(),
              startIndex: z.number()
            })
          }),
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(
              z.union([
                z.object({ kind: z.string(), text: z.string() }),
                z.object({
                  canonicalReference: z.string(),
                  kind: z.string(),
                  text: z.string()
                })
              ])
            ),
            fileUrlPath: z.string(),
            kind: z.string(),
            name: z.string(),
            releaseTag: z.string(),
            typeParameters: z.array(
              z.object({
                constraintTokenRange: z.object({
                  endIndex: z.number(),
                  startIndex: z.number()
                }),
                defaultTypeTokenRange: z.object({
                  endIndex: z.number(),
                  startIndex: z.number()
                }),
                typeParameterName: z.string()
              })
            ),
            typeTokenRange: z.object({
              endIndex: z.number(),
              startIndex: z.number()
            })
          }),
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(
              z.union([
                z.object({ kind: z.string(), text: z.string() }),
                z.object({
                  canonicalReference: z.string(),
                  kind: z.string(),
                  text: z.string()
                })
              ])
            ),
            fileUrlPath: z.string(),
            kind: z.string(),
            name: z.string(),
            overloadIndex: z.number(),
            parameters: z.array(
              z.object({
                isOptional: z.boolean(),
                parameterName: z.string(),
                parameterTypeTokenRange: z.object({
                  endIndex: z.number(),
                  startIndex: z.number()
                })
              })
            ),
            releaseTag: z.string(),
            returnTypeTokenRange: z.object({
              endIndex: z.number(),
              startIndex: z.number()
            }),
            typeParameters: z.array(
              z.object({
                constraintTokenRange: z.object({
                  endIndex: z.number(),
                  startIndex: z.number()
                }),
                defaultTypeTokenRange: z.object({
                  endIndex: z.number(),
                  startIndex: z.number()
                }),
                typeParameterName: z.string()
              })
            )
          }),
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(z.object({ kind: z.string(), text: z.string() })),
            fileUrlPath: z.string(),
            kind: z.string(),
            members: z.array(
              z.union([
                z.object({
                  canonicalReference: z.string(),
                  docComment: z.string(),
                  excerptTokens: z.array(
                    z.union([
                      z.object({ kind: z.string(), text: z.string() }),
                      z.object({
                        canonicalReference: z.string(),
                        kind: z.string(),
                        text: z.string()
                      })
                    ])
                  ),
                  kind: z.string(),
                  name: z.string(),
                  releaseTag: z.string(),
                  typeTokenRange: z.object({
                    endIndex: z.number(),
                    startIndex: z.number()
                  })
                }),
                z.object({
                  canonicalReference: z.string(),
                  docComment: z.string(),
                  excerptTokens: z.array(
                    z.union([
                      z.object({ kind: z.string(), text: z.string() }),
                      z.object({
                        canonicalReference: z.string(),
                        kind: z.string(),
                        text: z.string()
                      })
                    ])
                  ),
                  kind: z.string(),
                  name: z.string(),
                  releaseTag: z.string(),
                  typeParameters: z.array(
                    z.object({
                      constraintTokenRange: z.object({
                        endIndex: z.number(),
                        startIndex: z.number()
                      }),
                      defaultTypeTokenRange: z.object({
                        endIndex: z.number(),
                        startIndex: z.number()
                      }),
                      typeParameterName: z.string()
                    })
                  ),
                  typeTokenRange: z.object({
                    endIndex: z.number(),
                    startIndex: z.number()
                  })
                }),
                z.object({
                  canonicalReference: z.string(),
                  docComment: z.string(),
                  excerptTokens: z.array(z.object({ kind: z.string(), text: z.string() })),
                  kind: z.string(),
                  name: z.string(),
                  releaseTag: z.string(),
                  typeTokenRange: z.object({
                    endIndex: z.number(),
                    startIndex: z.number()
                  })
                })
              ])
            ),
            name: z.string(),
            preserveMemberOrder: z.boolean(),
            releaseTag: z.string()
          }),
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(
              z.union([
                z.object({ kind: z.string(), text: z.string() }),
                z.object({
                  canonicalReference: z.string(),
                  kind: z.string(),
                  text: z.string()
                })
              ])
            ),
            fileUrlPath: z.string(),
            isReadonly: z.boolean(),
            kind: z.string(),
            name: z.string(),
            releaseTag: z.string(),
            variableTypeTokenRange: z.object({
              endIndex: z.number(),
              startIndex: z.number()
            })
          }),
          z.object({
            canonicalReference: z.string(),
            docComment: z.string(),
            excerptTokens: z.array(z.object({ kind: z.string(), text: z.string() })),
            fileUrlPath: z.string(),
            kind: z.string(),
            name: z.string(),
            releaseTag: z.string(),
            typeTokenRange: z.object({
              endIndex: z.number(),
              startIndex: z.number()
            })
          })
        ])
      ),
      name: z.string(),
      preserveMemberOrder: z.boolean()
    })
  ),
  metadata: z.object({
    oldestForwardsCompatibleVersion: z.number(),
    schemaVersion: z.number(),
    toolPackage: z.string(),
    toolVersion: z.string(),
    tsdocConfig: z.object({
      $schema: z.string(),
      noStandardTags: z.boolean(),
      reportUnsupportedHtmlElements: z.boolean(),
      supportForTags: z.object({
        '@alpha': z.boolean(),
        '@beta': z.boolean(),
        '@betaDocumentation': z.boolean(),
        '@decorator': z.boolean(),
        '@defaultValue': z.boolean(),
        '@deprecated': z.boolean(),
        '@eventProperty': z.boolean(),
        '@example': z.boolean(),
        '@experimental': z.boolean(),
        '@inheritDoc': z.boolean(),
        '@internal': z.boolean(),
        '@internalRemarks': z.boolean(),
        '@label': z.boolean(),
        '@link': z.boolean(),
        '@override': z.boolean(),
        '@packageDocumentation': z.boolean(),
        '@param': z.boolean(),
        '@preapproved': z.boolean(),
        '@privateRemarks': z.boolean(),
        '@public': z.boolean(),
        '@readonly': z.boolean(),
        '@remarks': z.boolean(),
        '@returns': z.boolean(),
        '@sealed': z.boolean(),
        '@see': z.boolean(),
        '@throws': z.boolean(),
        '@typeParam': z.boolean(),
        '@virtual': z.boolean()
      }),
      tagDefinitions: z.array(
        z.union([
          z.object({ syntaxKind: z.string(), tagName: z.string() }),
          z.object({
            allowMultiple: z.boolean(),
            syntaxKind: z.string(),
            tagName: z.string()
          })
        ])
      )
    })
  }),
  name: z.string(),
  preserveMemberOrder: z.boolean()
});
