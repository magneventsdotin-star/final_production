"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import Stars from "@/app/components/common/Stars";
import { useFeaturedArtists } from "@/app/hooks/useArtists";

const parseCategory = (artist) => {
  const cat = artist.subCategory || artist.category || "Performer";
  if (typeof cat === "string") {
    return cat.split(",").map((x) => x.trim()).filter(Boolean).join(", ");
  }
  if (Array.isArray(cat)) {
    return cat.join(", ");
  }
  return "Performer";
};

const ArtistImage = ({ artist }) => {
  const fallbackSrc = "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp";
  const [imgSrc, setImgSrc] = useState(artist.img || fallbackSrc);

  return (
    <div
      className="hp-feat-img-wrap-v2"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Image
        src={imgSrc}
        alt={`Profile of ${artist.name}`}
        fill
        sizes="(max-width:768px) 100vw, 33vw"
        style={{ objectFit: "cover" }}
        draggable={false}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
      />
    </div>
  );
};

const SkeletonCard = () => (
  <div className="hp-feat-slide" style={{ width: "100%" }}>
    <div
      className="hp-feat-card"
      style={{
        height: "550px",
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="skeleton-pulse"
        style={{ height: "60%", background: "rgba(255,255,255,0.04)" }}
      />
      <div style={{ padding: 20 }}>
        <div className="skeleton-pulse" style={{ height: 12, width: "40%", borderRadius: 4, marginBottom: 10 }} />
        <div className="skeleton-pulse" style={{ height: 24, width: "80%", borderRadius: 6, marginBottom: 16 }} />
        <div className="skeleton-pulse" style={{ height: 14, width: "30%", borderRadius: 4, marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div className="skeleton-pulse" style={{ flex: 1, height: 36, borderRadius: 8 }} />
          <div className="skeleton-pulse" style={{ flex: 1, height: 36, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  </div>
);

function FeaturedArtistsSection() {
  const featuredRef = useRef(null);
  const { featuredArtists, loading, fetchFeatured } = useFeaturedArtists(6);

  const [pauseFeatured, setPauseFeatured] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);

  const isDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const sliderLeftRef = useRef(0); 
  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const moveFeatured = useCallback((direction) => {
    const scroller = featuredRef.current;
    if (!scroller) return;

    const card = scroller.querySelector("[data-featured-card]");
    const sWidth = scroller.clientWidth;
    const cardWidth = card ? card.getBoundingClientRect().width + 16 : sWidth * 0.86;
    const maxLeft = scroller.scrollWidth - sWidth - 4;

    const atEnd = scroller.scrollLeft >= maxLeft;
    const atStart = scroller.scrollLeft <= 2;

    if (direction > 0 && atEnd) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && atStart) {
      scroller.scrollTo({ left: maxLeft, behavior: "smooth" });
      return;
    }

    scroller.scrollBy({ left: cardWidth * direction, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

          const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    if (
      window.innerWidth < 768 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return () => window.removeEventListener("resize", checkDesktop);
    }

    const interval = setInterval(() => {
    
      if (document.visibilityState === "visible" && !pauseFeatured) {
        moveFeatured(1);
      }
    }, 3400);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkDesktop);
    };
  }, [pauseFeatured, moveFeatured]);

  
  
  const handlePointerDown = (e) => {
    if (e.pointerType !== "mouse" || !featuredRef.current) return;

    isDraggingRef.current = true;
    draggedRef.current = false;

    sliderLeftRef.current = featuredRef.current.offsetLeft;
    startXRef.current = e.pageX - sliderLeftRef.current;
    scrollLeftRef.current = featuredRef.current.scrollLeft;
  };

  const handlePointerMove = (e) => {
    if (e.pointerType !== "mouse" || !isDraggingRef.current || !featuredRef.current) return;

    e.preventDefault(); 

    const x = e.pageX - sliderLeftRef.current;
    const walk = (x - startXRef.current) * 2;

    if (Math.abs(walk) > 20) {
      draggedRef.current = true;
    }

    featuredRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handlePointerUp = (e) => {
    if (e.pointerType !== "mouse") return;
    isDraggingRef.current = false;
  };

 
  const pauseCarousel = () => setPauseFeatured(true);
  const resumeCarousel = () => setPauseFeatured(false);

  const skeletons = useMemo(() => Array.from({ length: 5 }).map((_, i) => (
    <SkeletonCard key={`skel-${i}`} />
  )), []);

  if (!loading && featuredArtists.length === 0) {
    return null;
  }

  return (
    <section className="hp-shell hp-block hp-featured-section">
      <div className="hp-feat-head-v2">
        <div className="hp-section-head">
          <h2>Featured Artists</h2>
        </div>

        <div className="hp-feat-actions-row">
          <Link href="/artists" className="hp-see-all-v2">
            See all →
          </Link>

          <div className="hp-feat-controls-v2" aria-label="Carousel Controls">
            <button
              type="button"
              className="lux-arrow-mini is-left"
              onClick={() => moveFeatured(-1)}
              aria-label="Previous Featured Artist"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              className="lux-arrow-mini"
              onClick={() => moveFeatured(1)}
              aria-label="Next Featured Artist"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={featuredRef}
        className="hp-feat-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured artists"
        onMouseEnter={pauseCarousel}
        onMouseLeave={resumeCarousel}
        onFocus={pauseCarousel}
        onBlur={resumeCarousel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          overflowX: "auto",
          touchAction: "pan-y",
          cursor: "grab"
        }}
      >
        {loading ? (
          skeletons
        ) : (
          featuredArtists.map((artist, i) => (
            <div
              key={artist.artist_no || artist.name}
              className="hp-feat-slide"
              data-featured-card
            >
              <article
                className="hp-feat-card-v2"
                style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Link
                  href={`/artist/${encodeURIComponent(artist.name)}`}
                  target={isDesktop ? "_blank" : undefined}
                  rel={isDesktop ? "noopener noreferrer" : undefined}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%",
                    flexGrow: 1,
                  }}
                  draggable={false}
                  onClick={(e) => {
                    if (draggedRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  
                  <ArtistImage artist={artist} />

                  <div className="hp-feat-info-v2">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <div>
                        <span className="hp-feat-genre-v2">
                          {parseCategory(artist)}
                        </span>

                        <h3 className="hp-feat-name-v2">{artist.name}</h3>

                        <span className="hp-feat-loc-v2">
                          {[artist.city, artist.state].filter(Boolean).join(", ") || "India"}
                        </span>

                        <div className="hp-feat-rating-v2">
                          <Stars count={Math.round(Number(artist.rating || 0))} />
                          <span className="hp-feat-score-v2">
                            {Number(artist.rating || 0).toFixed(1)}
                            {" · "}
                            {artist.successful_bookings || 0}
                            {" bookings"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </Link>
              </article>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default React.memo(FeaturedArtistsSection);