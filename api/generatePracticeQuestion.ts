import { handleGeneratePracticeQuestion } from '../server/generatedPracticeApi'

export async function POST(request: Request): Promise<Response> {
  return handleGeneratePracticeQuestion(request)
}
