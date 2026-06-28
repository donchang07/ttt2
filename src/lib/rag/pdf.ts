import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

/** PDF 바이트에서 텍스트 추출(페이지 병합). 서버리스 안전(unpdf=pdf.js, 네이티브 의존성 없음). */
export async function extractPdfText(data: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
