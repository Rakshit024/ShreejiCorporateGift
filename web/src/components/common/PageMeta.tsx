import { useEffect } from 'react';
import { DEFAULT_SEO } from '../../config/seo';

interface PageMetaProps {
  title?: string;
  description?: string;
}

function setMetaContent(selector: string, attribute: 'name' | 'property', value: string): void {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, selector.includes('property=') ? 'og:title' : 'description');
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const resolvedTitle = title ?? DEFAULT_SEO.title;
    const resolvedDescription = description ?? DEFAULT_SEO.description;

    document.title = resolvedTitle;
    setMetaContent('meta[name="description"]', 'name', resolvedDescription);
    setMetaContent('meta[property="og:title"]', 'property', resolvedTitle);
    setMetaContent('meta[property="og:description"]', 'property', resolvedDescription);
  }, [title, description]);

  return null;
}
