'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface BarrioSelectorProps {
  barrio: string | null
  onChange: (barrio: string | null) => void
  className?: string
}

// Curated list of Valencia neighborhoods and nearby towns
const VALENCIA_BARRIOS = [
  // Valencia City Center - Ciutat Vella
  'Ciutat Vella',
  'El Carme',
  'El Pilar',
  'La Seu',
  'La Xerea',
  'El Mercat',

  // L'Eixample
  "L'Eixample",
  'Ruzafa',
  'El Pla del Remei',
  'Gran Via',

  // Extramurs
  'Extramurs',
  'El Botànic',

  // Other City Districts
  'Campanar',
  'El Calvari',
  'Sant Pau',
  'La Saïdia',
  'El Pla del Real',
  'Exposició',
  'Mestalla',
  'Jaume Roig',
  'Olivereta',
  'Nou Moles',
  'Soternes',
  'Patraix',
  'Jesús',
  'La Creu del Grau',
  'Camí Fondo',
  'Penya-roja',
  'Quatre Carreres',
  'Monteolivete',
  'En Corts',
  'Malilla',
  'Na Rovella',
  'La Fontsanta',
  'La Punta',

  // Poblats Marítims (Maritime Districts)
  'Poblats Marítims',
  'El Cabanyal-El Canyamelar',
  'El Cabanyal',
  'El Canyamelar',
  'La Malva-rosa',
  'Beteró',
  'Natzaret',
  'El Grau',
  'El Marítim',

  // Other Districts
  'Camins al Grau',
  'Aiora',
  'Albors',
  'La Creu Coberta',
  'Algirós',
  'L\'Illa Perduda',
  'Ciutat de les Arts i les Ciències',
  'Benimaclet',
  'Camí de Vera',
  'Rascanya',
  'Tormos',
  'Sant Llorenç',
  'Orriols',
  'Torrefiel',
  'Sant Antoni',
  'Benicalap',
  'Ciutat Fallera',
  'Pobles del Nord',
  'Benifaraig',
  'Poble Nou',
  'Carpesa',
  'Cases de Bàrcena',
  'Pobles del Sud',
  'Castellar-l\'Oliveral',
  'El Palmar',
  'Horteta',
  'El Saler',
  'Pinedo',
  'Faitanar',
  'La Torre',
  'Pobles de l\'Oest',
  'Benimàmet',
  'Beniferri',

  // Metropolitan Area
  'Paterna',
  'Burjassot',
  'Mislata',
  'Torrent',
  'Xirivella',
  'Aldaia',
  'Quart de Poblet',
  'Manises',
  'Alboraya',
  'Tavernes Blanques',
  'Godella',
  'Rocafort',
  'Moncada',
  'Alfafar',
  'Sedaví',
  'Benetússer',
  'Alaquàs',
  'Picanya',
  'Paiporta',
  'Catarroja',
  'Albal',
  'Silla',
  'Massanassa',
  'Sueca',
  'Cullera',
  'Gandia',
  'Sagunto',
  'Alzira',
  'Xàtiva',
].sort()

export default function BarrioSelector({
  barrio,
  onChange,
  className = '',
}: BarrioSelectorProps) {
  const { t } = useTranslation()
  const [showOtherInput, setShowOtherInput] = useState(
    barrio && !VALENCIA_BARRIOS.includes(barrio)
  )

  const handleSelectChange = (value: string) => {
    if (value === 'otro') {
      setShowOtherInput(true)
      onChange(null)
    } else if (value === '') {
      setShowOtherInput(false)
      onChange(null)
    } else {
      setShowOtherInput(false)
      onChange(value)
    }
  }

  const handleOtherInputChange = (value: string) => {
    onChange(value || null)
  }

  return (
    <div className={className}>
      {!showOtherInput ? (
        <select
          value={barrio && VALENCIA_BARRIOS.includes(barrio) ? barrio : barrio ? 'otro' : ''}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t('barrio.select')}</option>
          {VALENCIA_BARRIOS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
          <option value="otro">{t('barrio.other')}</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={barrio || ''}
            onChange={(e) => handleOtherInputChange(e.target.value)}
            placeholder={t('barrio.otherPlaceholder')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={() => {
              setShowOtherInput(false)
              onChange(null)
            }}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            {t('barrio.backToList')}
          </button>
        </div>
      )}
    </div>
  )
}
