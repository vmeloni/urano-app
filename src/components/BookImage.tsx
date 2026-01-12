import { useState } from 'react';
import placeholderImage from '@/assets/images/book-placeholder.png';

interface BookImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function BookImage({ src, alt, className = '' }: BookImageProps) {
  const [error, setError] = useState(false);

  const imageSrc = error || !src ? placeholderImage : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

