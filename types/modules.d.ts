declare module 'pdf-parse' {
  interface PDFData {
    text: string
    numpages: number
    info: Record<string, unknown>
    metadata: Record<string, unknown>
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>
  export = pdfParse
}

declare module 'mammoth' {
  interface ConversionResult {
    value: string
    messages: Array<{ type: string; message: string }>
  }

  interface Options {
    path?: string
    buffer?: Buffer
  }

  export function convertToMarkdown(options: Options): Promise<ConversionResult>
  export function convertToHtml(options: Options): Promise<ConversionResult>
}
