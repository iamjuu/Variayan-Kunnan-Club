import { ArrowRight, ChevronLeft, ChevronRight, Images, Medal, Palette, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GalleryMosaic, gallerySrc, pickGallery } from '../components/gallery/GalleryMosaic'
import { ButtonLink } from '../components/ui/Button'
import { useApi } from '../lib/useApi'
import type { Category, GalleryImage, PublicSettings } from '../lib/types'

export function HomePage() {
  const { data: settings } = useApi<PublicSettings>('/settings/public')
  const { data: categories } = useApi<Category[]>('/categories')
  const { data: heroPhotos } = useApi<GalleryImage[]>('/gallery?hero=1&limit=1')
  const { data: featured } = useApi<GalleryImage[]>('/gallery?featured=1&limit=8')
  const { data: latest } = useApi<GalleryImage[]>('/gallery?limit=12')
  const arts = categories?.find((c) => c.slug === 'arts')
  const sports = categories?.find((c) => c.slug === 'sports')
  const open = settings?.registrationOpen !== false
  const hero = heroPhotos?.[0] ?? featured?.[0] ?? null
  const mosaic = pickGallery(featured, latest, 8).filter((img) => img._id !== hero?._id)
  const heroFrame = useRef<HTMLElement>(null)
  const [spot, setSpot] = useState<{ x: number; y: number; size: number } | null>(null)

  const moveSpot = useCallback((event: PointerEvent<HTMLElement>) => {
    const box = heroFrame.current?.getBoundingClientRect()
    if (!box) return
    if (event.pointerType !== 'mouse' && event.type === 'pointerdown') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    setSpot({
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      size: event.pointerType === 'mouse' ? 220 : 150,
    })
  }, [])

  const clearSpot = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.type === 'pointerup') return
    setSpot(null)
  }, [])

  const spotStyle = {
    '--spot-x': spot ? `${spot.x}px` : '50%',
    '--spot-y': spot ? `${spot.y}px` : '50%',
    '--spot-size': spot ? `${spot.size}px` : '0px',
  } as CSSProperties

  return (
    <>
      <section
        ref={heroFrame}
        className="relative min-h-[78vh] overflow-hidden text-white lg:min-h-[88vh]"
        style={{ touchAction: 'pan-y', ...spotStyle }}
        onPointerMove={moveSpot}
        onPointerDown={moveSpot}
        onPointerLeave={clearSpot}
        onPointerUp={clearSpot}
        onPointerCancel={clearSpot}
      >
        {hero ? (
          <HeroColorReveal src={gallerySrc(hero)} alt={hero.title || 'Variayan Kunan Club'} revealed={Boolean(spot)} />
        ) : (
          <>
            <div className="hero-kerala absolute inset-0" />
            <HeroShade />
          </>
        )}
        <div className="kasavu-shimmer relative h-[5px]" />
        <div className="pointer-events-none relative mx-auto flex min-h-[calc(78vh-5px)] max-w-6xl items-end px-4 py-16 sm:px-6 lg:min-h-[calc(88vh-5px)] lg:items-center lg:py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-sm font-semibold tracking-wide text-accent-300/55" lang="ml">
              വരിയാൻ കുന്നൻ ക്ലബ്
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white/50 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              A club for arts, sport and community.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/35">
              Variayan Kunan Club gathers neighbours through performance, play and celebration. Keralotsavam is our seasonal festival — not the whole story, but the brightest chapter of the year.
            </p>
       
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-8 overflow-hidden rounded-3xl bg-primary-900 text-white shadow-lift ring-1 ring-accent-400/40">
          <div className="kasavu-shimmer h-[4px]" />
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-accent-300 uppercase">
                <Sparkles className="size-3.5" /> Seasonal event
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl" lang="ml">
                കേരളോത്സവം
              </h2>
              <p className="mt-1 font-display text-xl text-accent-200">Keralotsavam — arts and sports festival</p>
              <p className="mt-3 max-w-xl text-white/65">
                Enter as an individual or as a team. Choose Arts or Sports, pick live competition items from the club list, and receive a registration ID instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {open ? (
                  <ButtonLink to="/register" size="lg">
                    Start registration <ArrowRight className="size-5" />
                  </ButtonLink>
                ) : (
                  <span className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-accent-200">Registrations are currently closed.</span>
                )}
                <ButtonLink to="/gallery" variant="ghost" size="lg" className="text-white hover:bg-white/8">
                  Festival photos
                </ButtonLink>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <CategoryPreview title="Arts" malayalam="കല" icon={<Palette className="size-6" />} count={arts?.activeEvents} />
              <CategoryPreview title="Sports" malayalam="കായികം" icon={<Medal className="size-6" />} count={sports?.activeEvents} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-600">The club</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-primary-950">Year-round, with a festival season.</h2>
          <p className="mt-3 text-ink/65">Meet, practise and celebrate together. Registration for Keralotsavam opens when the season arrives; the gallery stays as a living record of club life.</p>
        </div>
        <ClubCarousel />
      </section>

      <section className="bg-primary-950/3 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-accent-600" lang="ml">
                ഗാലറി
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-primary-950">From the club gallery</h2>
              <p className="mt-2 max-w-xl text-ink/60">Featured photographs uploaded by organisers. Open a photo to view it full size.</p>
            </div>
            <ButtonLink to="/gallery" variant="outline">
              Open gallery <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
          <GalleryMosaic images={mosaic} variant="page" emptyCount={6} className="mt-8" />
        </div>
      </section>
    </>
  )
}

function HeroColorReveal({ src, alt, revealed }: { src: string; alt: string; revealed: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <img src={src} alt={alt} className="hero-photo-bw absolute inset-0 size-full object-cover object-[center_42%]" draggable={false} />
      <HeroShade />
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className={`hero-photo-color absolute inset-0 z-[1] size-full object-cover object-[center_42%]${revealed ? ' is-revealed' : ''}`}
      />
    </div>
  )
}

function HeroShade() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-950/55 via-primary-950/28 to-primary-950/8" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-primary-950/12" />
      <div className="kasavu-pattern pointer-events-none absolute inset-0 opacity-[0.06]" />
    </>
  )
}

function CategoryPreview({
  title,
  malayalam,
  icon,
  count,
}: {
  title: string
  malayalam: string
  icon: ReactNode
  count?: { individual: number; group: number }
}) {
  return (
    <Link to="/register" className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/10 transition hover:bg-white/12">
      <span className="grid size-11 place-items-center rounded-2xl bg-accent-400/15 text-accent-300">{icon}</span>
      <p className="mt-3 font-display text-2xl font-semibold text-white">{title}</p>
      <p className="text-sm text-accent-300" lang="ml">
        {malayalam}
      </p>
      <p className="mt-2 text-sm text-white/55">{count ? `${count.individual} individual · ${count.group} group items open` : 'Loading items…'}</p>
    </Link>
  )
}

const CLUB_SLIDES = [
  {
    icon: Users,
    title: 'Community first',
    body: 'A neighbourhood club for gatherings, rehearsals and matches — Keralotsavam is one season inside a longer story.',
  },
  {
    icon: Medal,
    title: 'Live competition list',
    body: 'Festival items are managed by organisers. Inactive events never appear on the public form.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Registration photos are stored encrypted. Gallery photos you see here are public club pictures, chosen from the dashboard.',
  },
]

function ClubCarousel() {
  const count = CLUB_SLIDES.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)

  const go = useCallback((delta: number) => {
    setIndex((current) => (current + delta + count) % count)
  }, [count])

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => go(1), 5200)
    return () => window.clearInterval(timer)
  }, [go, paused])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current == null) return
    const delta = event.clientX - startX.current
    startX.current = null
    if (Math.abs(delta) < 40) return
    go(delta < 0 ? 1 : -1)
  }

  return (
    <div
      className="mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startX.current = null
      }}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-2xl">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {CLUB_SLIDES.map((slide) => {
              const Icon = slide.icon
              return (
                <article key={slide.title} className="card w-full shrink-0 p-6 sm:p-8" aria-roledescription="slide" aria-label={slide.title}>
                  <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary-50 text-primary-800">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-primary-900">{slide.title}</h3>
                  <p className="mt-2 max-w-2xl text-base text-ink/60">{slide.body}</p>
                </article>
              )
            })}
          </div>
        </div>
        <button
          type="button"
          className="absolute top-1/2 left-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary-900 shadow-soft ring-1 ring-primary-900/10 hover:bg-white sm:-left-3"
          aria-label="Previous slide"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          className="absolute top-1/2 right-2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary-900 shadow-soft ring-1 ring-primary-900/10 hover:bg-white sm:-right-3"
          aria-label="Next slide"
          onClick={() => go(1)}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Club highlights">
        {CLUB_SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={slide.title}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-primary-800' : 'w-2.5 bg-primary-900/20 hover:bg-primary-900/40'}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
