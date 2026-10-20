export async function formatMarkdown(input: string, proseWrap: 'preserve' | 'always' | 'never' = 'preserve'): Promise<string> {
  // Prettier is loaded on demand so it doesn't weigh down the initial page load.
  const [prettier, markdownPlugin] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/markdown'),
  ])
  return prettier.format(input, { parser: 'markdown', plugins: [markdownPlugin], proseWrap })
}
