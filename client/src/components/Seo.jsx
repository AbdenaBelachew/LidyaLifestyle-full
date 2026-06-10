import { useEffect } from 'react';

export default function Seo({ title, description } = {}) {
  useEffect(() => {
    document.title = title || 'LIDIYA LIFESTYLE — God Is In The Details';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        description ||
          'LIDIYA LIFESTYLE — Handwoven Ethiopian textiles. God is in the details.'
      );
    }
  }, [title, description]);

  return null;
}
