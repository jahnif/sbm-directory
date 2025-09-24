export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8,
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file) // fallback to original file
          }
        },
        'image/jpeg',
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export const validateImageFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return 'Image must be less than 10MB'
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Image must be JPEG, PNG, or WebP format'
  }

  return null
}

export const uploadImageToSupabase = async (file: File, path: string) => {
  const { supabase } = await import('@/lib/supabase')

  const { error } = await supabase.storage
    .from('family-images')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('family-images').getPublicUrl(path)

  return publicUrl
}
