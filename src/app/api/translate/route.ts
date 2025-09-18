import { NextRequest, NextResponse } from 'next/server'
import * as deepl from 'deepl-node'
import { TranslationRequest, TranslationResponse } from '@/types'

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json()
    const { text, source_lang, target_lang } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!source_lang || !target_lang) {
      return NextResponse.json(
        { error: 'Source and target languages are required' },
        { status: 400 }
      )
    }

    if (source_lang === target_lang) {
      return NextResponse.json({
        translated_text: text,
        detected_source_lang: source_lang
      } as TranslationResponse)
    }

    // Convert our language codes to DeepL format
    const deeplSourceLang = source_lang.toUpperCase() as deepl.SourceLanguageCode
    const deeplTargetLang = target_lang.toUpperCase() as deepl.TargetLanguageCode

    // Special handling for Spanish since DeepL uses 'ES' for European Spanish
    const targetLanguage = target_lang === 'es' ? 'ES' as deepl.TargetLanguageCode : deeplTargetLang

    const result = await translator.translateText(
      text,
      deeplSourceLang,
      targetLanguage
    )

    const response: TranslationResponse = {
      translated_text: result.text,
      detected_source_lang: result.detectedSourceLang?.toLowerCase()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}