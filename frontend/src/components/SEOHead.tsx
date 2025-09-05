import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  keywords?: string;
}

export default function SEOHead({
  title,
  description,
  image = '/default-blog-image.jpg',
  url = window.location.href,
  type = 'article',
  author,
  publishedTime,
  keywords
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} - PratBlog`;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo]');
    existingMetas.forEach(meta => meta.remove());

    // Create meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords || '' },
      { name: 'author', content: author || 'PratBlog' },
      
      // Open Graph tags
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image.startsWith('http') ? image : `${window.location.origin}${image}` },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'PratBlog' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image.startsWith('http') ? image : `${window.location.origin}${image}` },
      
      // Article specific tags
      ...(type === 'article' && publishedTime ? [
        { property: 'article:published_time', content: publishedTime },
        { property: 'article:author', content: author || 'PratBlog' }
      ] : [])
    ];

    // Add meta tags to head
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      
      if ('name' in tag) {
        meta.setAttribute('name', tag.name);
      } else if ('property' in tag) {
        meta.setAttribute('property', tag.property);
      }
      
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Cleanup function
    return () => {
      const seoMetas = document.querySelectorAll('meta[data-seo]');
      seoMetas.forEach(meta => meta.remove());
    };
  }, [title, description, image, url, type, author, publishedTime, keywords]);

  return null; // This component doesn't render anything
}