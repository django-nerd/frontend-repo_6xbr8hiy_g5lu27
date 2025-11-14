import { useEffect, useMemo, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// A simple 9:16 container helper
function Aspect({ children }) {
  return (
    <div className="relative w-full" style={{ paddingTop: `${(16/9)*100}%` }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

const defaultSlides = [
  {
    id: 's1',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
    items: [
      {
        id: 't1',
        text: 'Your first text',
        x: 0.2,
        y: 0.2,
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      },
    ],
  },
  {
    id: 's2',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop',
    items: [
      {
        id: 't2',
        text: 'Second slide text',
        x: 0.3,
        y: 0.6,
        fontSize: 28,
        color: '#ffef00',
        fontFamily: 'Inter, sans-serif',
      },
    ],
  },
  {
    id: 's3',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
    items: [
      {
        id: 't3',
        text: 'Third slide!',
        x: 0.5,
        y: 0.4,
        fontSize: 30,
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      },
    ],
  },
]

export default function SlideEditor() {
  const [slides, setSlides] = useState(defaultSlides)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = slides[activeIndex]
  const [selectedId, setSelectedId] = useState(null)
  const containerRefs = useRef({})

  const selectedItem = useMemo(() => {
    if (!activeSlide) return null
    return activeSlide.items.find((it) => it.id === selectedId) || null
  }, [activeSlide, selectedId])

  const addText = () => {
    if (!activeSlide) return
    const id = `t_${Date.now()}`
    const newItem = {
      id,
      text: 'New text',
      x: 0.5,
      y: 0.5,
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
    }
    const next = [...slides]
    next[activeIndex] = { ...activeSlide, items: [...activeSlide.items, newItem] }
    setSlides(next)
    setSelectedId(id)
  }

  const updateSelected = (patch) => {
    if (!selectedItem) return
    const next = slides.map((s, i) => {
      if (i !== activeIndex) return s
      return {
        ...s,
        items: s.items.map((it) => (it.id === selectedItem.id ? { ...it, ...patch } : it)),
      }
    })
    setSlides(next)
  }

  // Dragging logic in percentage space (0..1), bounded by image
  const onMouseDown = (e, itemId) => {
    e.stopPropagation()
    setSelectedId(itemId)
    const container = containerRefs.current[activeSlide.id]
    if (!container) return

    const rect = container.getBoundingClientRect()

    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY
      const nx = (clientX - rect.left) / rect.width
      const ny = (clientY - rect.top) / rect.height
      const clampedX = Math.min(1, Math.max(0, nx))
      const clampedY = Math.min(1, Math.max(0, ny))
      const newX = clampedX
      const newY = clampedY
      setSlides((prev) =>
        prev.map((s, i) =>
          i !== activeIndex
            ? s
            : {
                ...s,
                items: s.items.map((it) => (it.id === itemId ? { ...it, x: newX, y: newY } : it)),
              }
        )
      )
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }

  const Tool = () => (
    <div className="flex flex-wrap gap-2 items-center">
      <button onClick={addText} className="px-3 py-2 bg-blue-600 text-white rounded">Add Text</button>
      <select
        value={selectedItem?.fontFamily || 'Inter, sans-serif'}
        onChange={(e) => updateSelected({ fontFamily: e.target.value })}
        className="px-2 py-2 border rounded"
      >
        <option value="Inter, sans-serif">Inter</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="Arial, Helvetica, sans-serif">Arial</option>
        <option value="'Courier New', monospace">Courier New</option>
      </select>
      <label className="text-sm">Size</label>
      <input
        type="number"
        min={8}
        max={120}
        value={selectedItem?.fontSize || 24}
        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
        className="w-20 px-2 py-2 border rounded"
      />
      <label className="text-sm">Color</label>
      <input
        type="color"
        value={selectedItem?.color || '#ffffff'}
        onChange={(e) => updateSelected({ color: e.target.value })}
        className="w-10 h-10 p-0 border rounded"
      />
      <label className="text-sm">Text</label>
      <input
        type="text"
        value={selectedItem?.text || ''}
        onChange={(e) => updateSelected({ text: e.target.value })}
        className="px-2 py-2 border rounded w-48"
        placeholder="Edit selected text"
      />
    </div>
  )

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Slide text editor (functional demo)</h2>

      <div className="mb-4 p-3 bg-gray-50 rounded border">
        <Tool />
      </div>

      <Swiper
        modules={[Navigation, Pagination, A11y]}
        onSlideChange={(sw) => {
          setActiveIndex(sw.activeIndex)
          setSelectedId(null)
        }}
        navigation
        pagination={{ clickable: true }}
        className="rounded-lg overflow-hidden"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id}>
            <Aspect>
              <div
                ref={(el) => (containerRefs.current[slide.id] = el)}
                className="relative w-full h-full bg-black select-none"
                onMouseDown={() => setSelectedId(null)}
                onTouchStart={() => setSelectedId(null)}
              >
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {slide.items.map((it) => {
                  const isSelected = it.id === selectedId
                  return (
                    <div
                      key={it.id}
                      onMouseDown={(e) => onMouseDown(e, it.id)}
                      onTouchStart={(e) => onMouseDown(e, it.id)}
                      className={`absolute cursor-move active:scale-[0.995] ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: `${it.x * 100}%`,
                        top: `${it.y * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        color: it.color,
                        fontSize: `${it.fontSize}px`,
                        fontFamily: it.fontFamily,
                        whiteSpace: 'pre',
                        userSelect: 'none',
                        padding: isSelected ? '2px 4px' : '0px',
                        background: isSelected ? 'rgba(0,0,0,0.2)' : 'transparent',
                        borderRadius: '4px',
                      }}
                    >
                      {it.text}
                    </div>
                  )
                })}
              </div>
            </Aspect>
          </SwiperSlide>
        ))}
      </Swiper>

      <p className="text-sm text-gray-500 mt-3">
        Notes: Add text only affects the current slide. Each text can be moved anywhere within image
        bounds and styled independently. Use navigation arrows or swipe to switch slides.
      </p>
    </div>
  )
}
