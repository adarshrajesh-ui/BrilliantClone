import { handleCheckGeneratedAnswer } from '../server/generatedPracticeApi'

export async function POST(request: Request): Promise<Response> {
  return handleCheckGeneratedAnswer(request)
}
