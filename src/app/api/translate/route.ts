import { NextRequest, NextResponse } from 'next/server'
import * as deepl from 'deepl-node'
import { TranslationRequest, TranslationResponse } from '@/types'

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json()
    const { text, source_lang, target_lang } = body

    console.log('Translation request:', { text: text.substring(0, 100) + '...', source_lang, target_lang })

    if (!text || !text.trim()) {
      console.log('Translation error: Empty text provided')
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!source_lang || !target_lang) {
      console.log('Translation error: Missing language parameters', { source_lang, target_lang })
      return NextResponse.json(
        { error: 'Source and target languages are required' },
        { status: 400 }
      )
    }

    if (source_lang === target_lang) {
      console.log('Translation skipped: Same source and target language')
      return NextResponse.json({
        translated_text: text,
        detected_source_lang: source_lang
      } as TranslationResponse)
    }

    // Check if API key is available
    if (!process.env.DEEPL_API_KEY) {
      console.error('Translation error: DEEPL_API_KEY not found in environment')
      return NextResponse.json(
        { error: 'Translation service not configured' },
        { status: 500 }
      )
    }

    // Convert our language codes to DeepL format
    const deeplSourceLang = source_lang.toUpperCase() as deepl.SourceLanguageCode

    // DeepL requires specific language variants for target languages
    let targetLanguage: deepl.TargetLanguageCode
    if (target_lang === 'es') {
      targetLanguage = 'ES' as deepl.TargetLanguageCode
    } else if (target_lang === 'en') {
      targetLanguage = 'en-US' as deepl.TargetLanguageCode  // Use American English instead of deprecated 'EN'
    } else {
      // Fallback for any other languages (though we only support 'en' and 'es')
      targetLanguage = 'en-US' as deepl.TargetLanguageCode
    }

    console.log('Calling DeepL API with:', { deeplSourceLang, targetLanguage })

    const result = await translator.translateText(
      text,
      deeplSourceLang,
      targetLanguage
    )

    console.log('DeepL API success:', { originalLength: text.length, translatedLength: result.text.length })

    const response: TranslationResponse = {
      translated_text: result.text,
      detected_source_lang: result.detectedSourceLang?.toLowerCase()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Translation error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        return NextResponse.json(
          { error: 'Translation service authentication failed' },
          { status: 500 }
        )
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'Translation service quota exceeded' },
          { status: 500 }
        )
      }
    }

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