import { BRAND } from "../../content/site";

/*
 * Per-page <title>, description and social preview tags. React 19 hoists these into <head>.
 * Pass `jsonLd` to add structured data (e.g. a Product) for search engines.
 */
const PageMeta = ({ title, description, image, jsonLd }) => {
  const fullTitle = title ? `${title} | ${BRAND.name}` : `${BRAND.name}: Handcrafted Fine Jewellery`;
  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </>
  );
};

export default PageMeta;
