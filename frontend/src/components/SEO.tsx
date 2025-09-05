import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  structuredData?: object;
}

const SEO = ({ title, description, canonical, image, structuredData }: SEOProps) => {
  const fullTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const metaDescription = description?.slice(0, 160);
  const url = canonical || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {url && <link rel="canonical" href={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:title" content={fullTitle} />
      {metaDescription && (
        <meta property="og:description" content={metaDescription} />
      )}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {image && <meta name="twitter:image" content={image} />}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
