import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage?: string;
}

interface ProductSliderProps {
  products: Product[];
  onAddToCart: (productId: string, quantity: number) => void;
}

export default function ProductSlider({ products, onAddToCart }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isAtStart = scrollLeft <= 10;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const cardWidth = scrollRef.current.querySelector('div')?.clientWidth || 0;
    const gap = 16; // gap-4 = 16px
    const scrollAmount = cardWidth + gap;

    const newScrollLeft =
      scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Flecha izquierda - Siempre visible cuando hay scroll hacia la izquierda */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Desplazar izquierda"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
      )}

      {/* Contenedor de productos con scroll horizontal */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-1 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[calc(25%-12px)] min-w-[200px] md:min-w-[220px]"
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>

      {/* Flecha derecha - Siempre visible cuando hay scroll hacia la derecha */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Desplazar derecha"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      )}
    </div>
  );
}

